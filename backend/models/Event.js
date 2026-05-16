const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  organizer: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  venue: { type: String, trim: true, default: '' },
  category: { type: String, enum: ['workshop', 'seminar', 'conference', 'hackathon', 'webinar', 'other'], default: 'other' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  participantCount: { type: Number, default: 0 },
  certificatesIssued: { type: Number, default: 0 },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
