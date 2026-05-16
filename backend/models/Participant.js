const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  certificateIssued: { type: Boolean, default: false },
  certificateId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Compound index so a participant can't be added twice to same event
participantSchema.index({ email: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Participant', participantSchema);
