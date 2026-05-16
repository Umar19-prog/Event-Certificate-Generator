import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { admin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsAPI.get()
      .then(data => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading-center"><div className="spinner spinner-lg"></div><p>Loading dashboard...</p></div>;
  }

  const s = stats?.stats || { totalEvents: 0, totalParticipants: 0, totalCertificates: 0, blockchainBlocks: 0 };

  return (
    <div className="page-container" style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="page-header">
        <div className="hero-badge" style={{ marginBottom: '0.75rem' }}>👋 Welcome back</div>
        <h1 className="page-title">{admin?.name || 'Admin'}'s Dashboard</h1>
        <p className="page-subtitle">Overview of your events, participants, and certificates</p>
      </div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card blue">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{s.totalEvents}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="stat-card emerald">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{s.totalParticipants}</div>
          <div className="stat-label">Total Participants</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-icon">📜</div>
          <div className="stat-value">{s.totalCertificates}</div>
          <div className="stat-label">Certificates Issued</div>
        </div>
        <div className="stat-card rose">
          <div className="stat-icon">⛓</div>
          <div className="stat-value">{s.blockchainBlocks}</div>
          <div className="stat-label">Blockchain Blocks</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⚡ Quick Actions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/admin/events" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              📅 Manage Events
            </Link>
            <Link to="/admin/certificates" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              📜 View Certificates
            </Link>
            <Link to="/verify" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
              🔍 Verification Portal
            </Link>
          </div>
        </div>

        {/* Recent Certificates */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📜 Recent Certificates</h3>
            <Link to="/admin/certificates" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {stats?.recentCertificates?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stats.recentCertificates.map(cert => (
                <div key={cert.certificateId} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-1)'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cert.participantName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cert.eventTitle}</div>
                  </div>
                  <span className="badge badge-emerald">✓ Verified</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No certificates issued yet.</p>
          )}
        </div>

        {/* Blockchain Status */}
        <div className="blockchain-info">
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>⛓ Blockchain Ledger Status</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase' }}>Total Blocks</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{s.blockchainBlocks}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase' }}>Chain Integrity</div>
              <div style={{ marginTop: '4px' }}>
                <span className="badge badge-emerald">{s.chainValid !== false ? '✓ Valid' : '✗ Compromised'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📋 Recent Activity</h3>
          </div>
          {stats?.recentActivities?.length > 0 ? (
            <div>
              {stats.recentActivities.slice(0, 6).map((act, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-dot"></div>
                  <div style={{ flex: 1 }}>
                    <div className="activity-text">{act.action}: {act.details}</div>
                    <div className="activity-time">{new Date(act.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No activity yet. Create your first event!</p>
          )}
        </div>
      </div>
    </div>
  );
}
