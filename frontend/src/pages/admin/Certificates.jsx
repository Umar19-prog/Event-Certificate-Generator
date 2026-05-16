import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { certificatesAPI } from '../../services/api';
import { useToast } from '../../components/ToastProvider';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const loadCertificates = (searchTerm = '') => {
    setLoading(true);
    certificatesAPI.list('', searchTerm)
      .then(data => setCertificates(data.certificates || []))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCertificates(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadCertificates(search);
  };

  return (
    <div className="page-container" style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="toolbar">
        <div>
          <h1 className="page-title">📜 All Certificates</h1>
          <p className="page-subtitle">View and manage all issued certificates</p>
        </div>
        <form onSubmit={handleSearch} className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner spinner-lg"></div><p>Loading certificates...</p></div>
      ) : certificates.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">📜</div>
          <p>{search ? 'No certificates match your search.' : 'No certificates issued yet.'}</p>
          {search && (
            <button className="btn btn-secondary" onClick={() => { setSearch(''); loadCertificates(); }}>Clear Search</button>
          )}
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Showing {certificates.length} certificate{certificates.length !== 1 ? 's' : ''}
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Certificate ID</th>
                  <th>Participant</th>
                  <th>Event</th>
                  <th>Event Date</th>
                  <th>Blockchain TX</th>
                  <th>Issued</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((c, i) => (
                  <tr key={c._id}>
                    <td>{i + 1}</td>
                    <td>
                      <code style={{ fontSize: '0.78rem', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: '4px' }}>
                        {c.certificateId}
                      </code>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.participantName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.participantEmail}</div>
                    </td>
                    <td style={{ fontWeight: 500, fontSize: '0.9rem' }}>{c.eventTitle}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(c.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <span className="truncate" style={{ maxWidth: '120px', display: 'inline-block', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        {c.transactionHash}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(c.issuedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-sm">
                        <a href={certificatesAPI.download(c.certificateId)} className="btn btn-primary btn-sm" target="_blank" rel="noreferrer">
                          📥 PDF
                        </a>
                        <Link to={`/verify?id=${c.certificateId}`} className="btn btn-ghost btn-sm" title="Verify">
                          🔍
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
