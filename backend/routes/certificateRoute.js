const express = require('express');
const Certificate = require('../models/Certificate');
const Participant = require('../models/Participant');
const Event = require('../models/Event');
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middlewares/authMiddleware');
const { generateCertificateId, calculateHash, generateCertificatePDF } = require('../services/certificateService');
const blockchain = require('../services/blockchainService');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// POST /api/certificates/generate — generate certificates for an event
router.post('/generate', auth, async (req, res) => {
  try {
    const { eventId, participantIds } = req.body;
    if (!eventId) return res.status(400).json({ success: false, message: 'eventId is required.' });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    // Get participants (all or specific ones)
    let query = { event: eventId, certificateIssued: false };
    if (participantIds && participantIds.length > 0) {
      query._id = { $in: participantIds };
    }
    const participants = await Participant.find(query);

    if (participants.length === 0) {
      return res.status(400).json({ success: false, message: 'No eligible participants found.' });
    }

    const results = [];

    for (const participant of participants) {
      try {
        const certId = generateCertificateId();

        // Generate certificate data hash
        const certData = {
          certificateId: certId,
          participantName: participant.name,
          participantEmail: participant.email,
          eventTitle: event.title,
          eventDate: event.date,
          organizer: event.organizer,
          issuedAt: new Date().toISOString()
        };
        const certHash = calculateHash(certData);

        // Store on blockchain
        const txResult = blockchain.addCertificate(certId, certHash, event.organizer);

        // Generate PDF
        const { fileName } = await generateCertificatePDF({
          certificateId: certId,
          participantName: participant.name,
          eventTitle: event.title,
          eventDate: event.date,
          organizer: event.organizer
        });

        // Save to database
        const certificate = new Certificate({
          certificateId: certId,
          participantName: participant.name,
          participantEmail: participant.email,
          eventTitle: event.title,
          eventDate: event.date,
          organizer: event.organizer,
          event: eventId,
          participant: participant._id,
          hash: certHash,
          transactionHash: txResult.transactionHash,
          blockchainVerified: true,
          pdfPath: fileName,
          issuedBy: req.adminId
        });
        await certificate.save();

        // Mark participant as certificate issued
        await Participant.findByIdAndUpdate(participant._id, {
          certificateIssued: true,
          certificateId: certId
        });

        results.push({
          participantName: participant.name,
          certificateId: certId,
          transactionHash: txResult.transactionHash,
          status: 'success'
        });
      } catch (err) {
        results.push({
          participantName: participant.name,
          status: 'error',
          error: err.message
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;

    // Update event certificate count
    await Event.findByIdAndUpdate(eventId, { $inc: { certificatesIssued: successCount } });

    await ActivityLog.create({
      action: 'Certificates Generated',
      details: `${successCount} certificates generated for "${event.title}"`,
      admin: req.adminId,
      entityType: 'certificate',
      entityId: eventId
    });

    res.json({
      success: true,
      message: `${successCount} certificates generated successfully!`,
      results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/certificates — list certificates
router.get('/', auth, async (req, res) => {
  try {
    const { eventId, search } = req.query;
    let query = { issuedBy: req.adminId };

    if (eventId) query.event = eventId;
    if (search) {
      query.$or = [
        { participantName: { $regex: search, $options: 'i' } },
        { certificateId: { $regex: search, $options: 'i' } },
        { participantEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const certificates = await Certificate.find(query).sort({ issuedAt: -1 });
    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/certificates/download/:certId — download PDF
router.get('/download/:certId', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certId });
    if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found.' });

    const filePath = path.join(__dirname, '..', 'generated', certificate.pdfPath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'PDF file not found.' });
    }

    res.download(filePath, `${certificate.certificateId}.pdf`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
