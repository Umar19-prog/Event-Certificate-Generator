const express = require('express');
const Event = require('../models/Event');
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middlewares/authMiddleware');
const router = express.Router();

// GET /api/events — list all events for this admin
router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.adminId }).sort({ createdAt: -1 });
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/events/:id — single event
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, createdBy: req.adminId });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/events — create event
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, organizer, date, venue, category } = req.body;

    if (!title || !organizer || !date) {
      return res.status(400).json({ success: false, message: 'Title, organizer, and date are required.' });
    }

    const event = new Event({
      title, description, organizer, date, venue, category,
      createdBy: req.adminId
    });
    await event.save();

    await ActivityLog.create({
      action: 'Event Created',
      details: `Event "${title}" created`,
      admin: req.adminId,
      entityType: 'event',
      entityId: event._id.toString()
    });

    res.status(201).json({ success: true, message: 'Event created!', event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/events/:id — update event
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.adminId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    await ActivityLog.create({
      action: 'Event Updated',
      details: `Event "${event.title}" updated`,
      admin: req.adminId,
      entityType: 'event',
      entityId: event._id.toString()
    });

    res.json({ success: true, message: 'Event updated!', event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/events/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, createdBy: req.adminId });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    await ActivityLog.create({
      action: 'Event Deleted',
      details: `Event "${event.title}" deleted`,
      admin: req.adminId,
      entityType: 'event',
      entityId: event._id.toString()
    });

    res.json({ success: true, message: 'Event deleted!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
