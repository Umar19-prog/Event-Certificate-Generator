import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsAPI, participantsAPI, certificatesAPI } from '../../services/api';
import { useToast } from '../../components/ToastProvider';

export default function EventDetail() {
  const { id } = useParams();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('participants');

  // Add participant form
  const [showAddForm, setShowAddForm] = useState(false);
  const [pForm, setPForm] = useState({ name: '', email: '' });
  const [addingParticipant, setAddingParticipant] = useState(false);

  // CSV upload
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Certificate generation
  const [generating, setGenerating] = useState(false);

  const loadData = async () => {
    try {
      const [eventData, participantsData, certsData] = await Promise.all([
        eventsAPI.get(id),
        participantsAPI.list(id),
        certificatesAPI.list(id)
      ]);
      setEvent(eventData.event);
      setParticipants(participantsData.participants || []);
      setCertificates(certsData.certificates || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  // Add single participant
  const handleAddParticipant = async (e) => {
    e.preventDefault();
    setAddingParticipant(true);
    try {
      await participantsAPI.add({ ...pForm, eventId: id });
      toast.success(`${pForm.name} added!`);
      setPForm({ name: '', email: '' });
      setShowAddForm(false);
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAddingParticipant(false);
    }
  };

  // CSV Upload
  const handleCSVUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await participantsAPI.uploadCSV(id, file);
      if (result.success) {
        toast.success(result.message);
        loadData();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error('CSV upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) handleCSVUpload(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) handleCSVUpload(e.dataTransfer.files[0]);
  };

  // Generate certificates
  const handleGenerate = async () => {
    const eligible = participants.filter(p => !p.certificateIssued);
    if (eligible.length === 0) {
      toast.error('No eligible participants (all already have certificates).');
      return;
    }
    if (!window.confirm(`Generate certificates for ${eligible.length} participant(s)? This will store hashes on the blockchain.`)) return;

    setGenerating(true);
    try {
      const result = await certificatesAPI.generate(id);
      toast.success(result.message);
      setTab('certificates');
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  // Delete participant
  const handleDeleteParticipant = async (pid, name) => {
    if (!window.confirm(`Remove ${name} from this event?`)) return;
    try {
      await participantsAPI.delete(pid);
      toast.success('Participant removed.');
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return <div className="loading-center"><div className="spinner spinner-lg"></div><p>Loading event...</p></div>;
  }

  if (!event) {
    return (
      <div className="page-container">
        <div className="card empty-state">
          <div className="empty-icon">❌</div>
          <p>Event not found.</p>
          <Link to="/admin/events" className="btn btn-primary">← Back to Events</Link>
        </div>
      </div>
    );
  }

  const eligibleCount = participants.filter(p => !p.certificateIssued).length;

  return (
    <div className="page-container" style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/admin/events" style={{ fontSize: '0.9rem', color: 'var(--primary-600)', fontWeight: 500, marginBottom: '0.75rem', display: 'inline-block' }}>
          ← Back to Events
        </Link>
        <h1 className="page-title">{event.title}</h1>
        <div className="flex gap-md" style={{ marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>👤 {event.organizer}</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            📆 {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          {event.venue && <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>📍 {event.venue}</span>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{participants.length}</div>
          <div className="stat-label">Participants</div>
        </div>
        <div className="stat-card emerald">
          <div className="stat-icon">📜</div>
          <div className="stat-value">{certificates.length}</div>
          <div className="stat-label">Certificates Issued</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{eligibleCount}</div>
          <div className="stat-label">Pending Generation</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="toolbar">
        <div className="flex gap-sm">
          <button className={`btn ${tab === 'participants' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setTab('participants')}>
            👥 Participants ({participants.length})
          </button>
          <button className={`btn ${tab === 'certificates' ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setTab('certificates')}>
            📜 Certificates ({certificates.length})
          </button>
        </div>
        <div className="flex gap-sm">
          {tab === 'participants' && (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
                ＋ Add Participant
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <><div className="spinner" style={{ width: 14, height: 14 }}></div> Uploading...</> : '📎 Upload CSV'}
              </button>
              <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileChange} />
            </>
          )}
          {eligibleCount > 0 && (
            <button className="btn btn-success btn-sm" onClick={handleGenerate} disabled={generating}>
              {generating ? <><div className="spinner" style={{ width: 14, height: 14 }}></div> Generating...</> : `⚡ Generate ${eligibleCount} Certificates`}
            </button>
          )}
        </div>
      </div>

      {/* Add Participant Form */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: '1.5rem', animation: 'slideUp 0.3s ease' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Add Participant</h3>
          <form onSubmit={handleAddParticipant} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label className="form-label">Name</label>
              <input className="form-input" placeholder="Full name" value={pForm.name} onChange={(e) => setPForm({ ...pForm, name: e.target.value })} required />
            </div>
            <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="email@example.com" value={pForm.email} onChange={(e) => setPForm({ ...pForm, email: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={addingParticipant}>
              {addingParticipant ? 'Adding...' : 'Add'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(false)}>Cancel</button>
          </form>
        </div>
      )}

      {/* CSV Upload Zone */}
      {tab === 'participants' && (
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          style={{ marginBottom: '1.5rem' }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-icon">📁</div>
          <p><strong>Drag & drop a CSV file</strong> or click to browse</p>
          <p className="upload-hint">CSV should have "name" and "email" columns</p>
        </div>
      )}

      {/* Participants Table */}
      {tab === 'participants' && (
        participants.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Certificate Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, i) => (
                  <tr key={p._id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.email}</td>
                    <td>
                      {p.certificateIssued ? (
                        <span className="badge badge-emerald">✓ Issued</span>
                      ) : (
                        <span className="badge badge-gray">⏳ Pending</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteParticipant(p._id, p.name)} style={{ color: 'var(--accent-rose)' }}>
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card empty-state">
            <div className="empty-icon">👥</div>
            <p>No participants yet. Add them manually or upload a CSV file.</p>
          </div>
        )
      )}

      {/* Certificates Table */}
      {tab === 'certificates' && (
        certificates.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Certificate ID</th>
                  <th>Participant</th>
                  <th>Transaction Hash</th>
                  <th>Issued At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((c, i) => (
                  <tr key={c._id}>
                    <td>{i + 1}</td>
                    <td>
                      <code style={{ fontSize: '0.8rem', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: '4px' }}>
                        {c.certificateId}
                      </code>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.participantName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.participantEmail}</div>
                    </td>
                    <td>
                      <span className="truncate" style={{ maxWidth: '140px', display: 'inline-block', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        {c.transactionHash}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(c.issuedAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-sm">
                        <a href={certificatesAPI.download(c.certificateId)} className="btn btn-secondary btn-sm" target="_blank" rel="noreferrer">
                          📥 PDF
                        </a>
                        <Link to={`/verify?id=${c.certificateId}`} className="btn btn-ghost btn-sm">
                          🔍
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card empty-state">
            <div className="empty-icon">📜</div>
            <p>No certificates generated yet. Add participants and click "Generate Certificates".</p>
          </div>
        )
      )}
    </div>
  );
}
