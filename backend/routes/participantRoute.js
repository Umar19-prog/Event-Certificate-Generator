const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Participant = require('../models/Participant');
const Event = require('../models/Event');
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middlewares/authMiddleware');
const router = express.Router();

// Multer config for CSV uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `csv-${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// GET /api/participants?eventId=xxx
router.get('/', auth, async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = eventId ? { event: eventId } : {};
    const participants = await Participant.find(filter).populate('event', 'title date').sort({ createdAt: -1 });
    res.json({ success: true, participants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/participants — add single participant
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, eventId } = req.body;
    if (!name || !email || !eventId) {
      return res.status(400).json({ success: false, message: 'Name, email, and eventId are required.' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    const participant = new Participant({ name, email, event: eventId });
    await participant.save();

    await Event.findByIdAndUpdate(eventId, { $inc: { participantCount: 1 } });

    await ActivityLog.create({
      action: 'Participant Added',
      details: `${name} added to "${event.title}"`,
      admin: req.adminId,
      entityType: 'participant',
      entityId: participant._id.toString()
    });

    res.status(201).json({ success: true, message: 'Participant added!', participant });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Participant already exists for this event.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/participants/upload-csv — bulk CSV upload
router.post('/upload-csv', auth, upload.single('file'), async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) return res.status(400).json({ success: false, message: 'eventId is required.' });
    if (!req.file) return res.status(400).json({ success: false, message: 'CSV file is required.' });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    const participants = [];
    const errors = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
          const name = row.name || row.Name || row.NAME || '';
          const email = row.email || row.Email || row.EMAIL || '';
          if (name.trim() && email.trim()) {
            participants.push({ name: name.trim(), email: email.trim().toLowerCase(), event: eventId });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    let added = 0;
    let duplicates = 0;

    for (const p of participants) {
      try {
        await Participant.create(p);
        added++;
      } catch (err) {
        if (err.code === 11000) duplicates++;
        else errors.push(`${p.name}: ${err.message}`);
      }
    }

    await Event.findByIdAndUpdate(eventId, { $inc: { participantCount: added } });

    // Cleanup uploaded file
    fs.unlinkSync(req.file.path);

    await ActivityLog.create({
      action: 'CSV Upload',
      details: `${added} participants added to "${event.title}" (${duplicates} duplicates skipped)`,
      admin: req.adminId,
      entityType: 'participant'
    });

    res.json({
      success: true,
      message: `Successfully added ${added} participants. ${duplicates} duplicates skipped.`,
      added,
      duplicates,
      errors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/participants/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const participant = await Participant.findByIdAndDelete(req.params.id);
    if (!participant) return res.status(404).json({ success: false, message: 'Participant not found.' });

    await Event.findByIdAndUpdate(participant.event, { $inc: { participantCount: -1 } });

    res.json({ success: true, message: 'Participant removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
