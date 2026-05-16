const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateId: { type: String, required: true, unique: true, index: true },
  participantName: { type: String, required: true },
  participantEmail: { type: String, required: true },
  eventTitle: { type: String, required: true },
  eventDate: { type: Date, required: true },
  organizer: { type: String, required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  participant: { type: mongoose.Schema.Types.ObjectId, ref: 'Participant', required: true },
  hash: { type: String, required: true },
  transactionHash: { type: String, default: null },
  blockchainVerified: { type: Boolean, default: false },
  pdfPath: { type: String, default: null },
  issuedAt: { type: Date, default: Date.now },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }
});

module.exports = mongoose.model('Certificate', certificateSchema);
