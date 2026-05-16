const express = require('express');
const Certificate = require('../models/Certificate');
const Event = require('../models/Event');
const Participant = require('../models/Participant');
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middlewares/authMiddleware');
const blockchain = require('../services/blockchainService');
const router = express.Router();

// GET /api/stats — admin dashboard analytics
router.get('/', auth, async (req, res) => {
  try {
    const adminId = req.adminId;

    const [totalEvents, totalParticipants, totalCertificates, recentActivities] = await Promise.all([
      Event.countDocuments({ createdBy: adminId }),
      Participant.countDocuments(),
      Certificate.countDocuments({ issuedBy: adminId }),
      ActivityLog.find({ admin: adminId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    // Event breakdown by category
    const eventsByCategory = await Event.aggregate([
      { $match: { createdBy: require('mongoose').Types.ObjectId.createFromHexString(adminId) } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Recent certificates
    const recentCertificates = await Certificate.find({ issuedBy: adminId })
      .sort({ issuedAt: -1 })
      .limit(5)
      .select('certificateId participantName eventTitle issuedAt transactionHash')
      .lean();

    res.json({
      success: true,
      stats: {
        totalEvents,
        totalParticipants,
        totalCertificates,
        blockchainBlocks: blockchain.getChainLength(),
        chainValid: blockchain.isChainValid()
      },
      eventsByCategory,
      recentCertificates,
      recentActivities
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
