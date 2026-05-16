import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../../services/api';
import { useToast } from '../../components/ToastProvider';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', organizer: '', date: '', venue: '', category: 'workshop' });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const loadEvents = () => {
    setLoading(true);
    eventsAPI.list()
      .then(data => setEvents(data.events || []))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEvents(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await eventsAPI.create(form);
      toast.success('Event created successfully!');
      setShowModal(false);
      setForm({ title: '', description: '', organizer: '', date: '', venue: '', category: 'workshop' });
      loadEvents();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete event "${title}"? This cannot be undone.`)) return;
    try {
      await eventsAPI.delete(id);
      toast.success('Event deleted.');
      loadEvents();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const categoryColors = {
    workshop: 'badge-blue',
    seminar: 'badge-emerald',
    conference: 'badge-gold',
    hackathon: 'badge-rose',
    webinar: 'badge-blue',
    other: 'badge-gray'
  };

  return (
    <div className="page-container" style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="toolbar">
        <div>
          <h1 className="page-title">📅 Events</h1>
          <p className="page-subtitle">Create and manage your events</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ＋ Create Event
        </button>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner spinner-lg"></div><p>Loading events...</p></div>
      ) : events.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">📅</div>
          <p>No events yet. Create your first event to get started!</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>＋ Create Event</button>
        </div>
      ) : (
        <div className="grid-3">
          {events.map(event => (
            <div className="card" key={event._id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-header">
                <span className={`badge ${categoryColors[event.category] || 'badge-gray'}`}>
                  {event.category}
                </span>
                <span className={`badge ${event.status === 'completed' ? 'badge-emerald' : event.status === 'ongoing' ? 'badge-gold' : 'badge-blue'}`}>
                  {event.status}
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>{event.title}</h3>
              {event.description && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                  {event.description.substring(0, 100)}{event.description.length > 100 ? '...' : ''}
                </p>
              )}
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                👤 {event.organizer}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                📆 {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              {event.venue && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  📍 {event.venue}
                </div>
              )}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-700)' }}>{event.participantCount || 0}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Participants</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{event.certificatesIssued || 0}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Certificates</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <Link to={`/admin/events/${event._id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  Manage →
                </Link>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(event._id, event.title)}>
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">📅 Create New Event</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Event Title *</label>
                  <input name="title" className="form-input" placeholder="e.g. Web Development Workshop" value={form.title} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea name="description" className="form-textarea" placeholder="Brief description of the event" value={form.description} onChange={handleChange}></textarea>
                </div>
                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Organizer *</label>
                    <input name="organizer" className="form-input" placeholder="Organization name" value={form.organizer} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input name="date" type="date" className="form-input" value={form.date} onChange={handleChange} required />
                  </div>
                </div>
                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Venue</label>
                    <input name="venue" className="form-input" placeholder="Event location" value={form.venue} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select name="category" className="form-select" value={form.category} onChange={handleChange}>
                      <option value="workshop">Workshop</option>
                      <option value="seminar">Seminar</option>
                      <option value="conference">Conference</option>
                      <option value="hackathon">Hackathon</option>
                      <option value="webinar">Webinar</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><div className="spinner" style={{ width: 16, height: 16 }}></div> Creating...</> : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
