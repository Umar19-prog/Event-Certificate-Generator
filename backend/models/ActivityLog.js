const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  details: { type: String, default: '' },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  entityType: { type: String, enum: ['event', 'participant', 'certificate', 'auth'], required: true },
  entityId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
