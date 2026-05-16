import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyAPI, certificatesAPI } from '../services/api';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const [certId, setCertId] = useState(searchParams.get('id') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!certId.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await verifyAPI.verify(certId.trim());
      setResult(data);
    } catch (err) {
      setResult({ verified: false, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify if ID in URL
  useState(() => {
    if (searchParams.get('id')) handleVerify();
  }, []);

  return (
    <div className="page-container" style={{ maxWidth: '700px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔍</div>
        <h1 className="page-title" style={{ textAlign: 'center' }}>Verify Certificate</h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>
          Enter a Certificate ID or scan the QR code to verify authenticity
        </p>
      </div>

      <form onSubmit={handleVerify} style={{ display: 'flex', gap: '12px', marginBottom: '2rem', animation: 'fadeIn 0.4s ease 0.1s both' }}>
        <input
          id="verify-input"
          type="text"
          className="form-input"
          placeholder="Enter Certificate ID (e.g. CERT-XXXXX-YYYYYYY)"
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !certId.trim()}>
          {loading ? <div className="spinner" style={{ width: 18, height: 18 }}></div> : 'Verify'}
        </button>
      </form>

      {loading && (
        <div className="loading-center">
          <div className="spinner spinner-lg"></div>
          <p>Verifying on blockchain...</p>
        </div>
      )}

      {!loading && searched && result && (
        <div className="card" style={{ animation: 'slideUp 0.4s ease' }}>
          <div className={`verify-result ${result.verified ? 'verify-valid' : 'verify-invalid'}`}>
            <div className="verify-icon">
              {result.verified ? '✅' : '❌'}
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              {result.verified ? 'Certificate Valid!' : 'Certificate Not Verified'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {result.message}
            </p>
          </div>

          {result.verified && result.certificate && (
            <>
              <div style={{ borderTop: '1px solid var(--surface-3)', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>📋 Certificate Details</h3>
                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Recipient</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>{result.certificate.participantName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Event</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>{result.certificate.eventTitle}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Date</div>
                    <div style={{ fontSize: '1rem' }}>{new Date(result.certificate.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Organizer</div>
                    <div style={{ fontSize: '1rem' }}>{result.certificate.organizer}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Certificate ID</div>
                    <div style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{result.certificate.certificateId}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Issued At</div>
                    <div style={{ fontSize: '1rem' }}>{new Date(result.certificate.issuedAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {result.blockchain && (
                <div className="blockchain-info" style={{ marginTop: '1.5rem' }}>
                  <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>⛓ Blockchain Details</h3>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase' }}>Transaction Hash</div>
                      <div className="tx-hash">{result.certificate.transactionHash}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase' }}>Block Index</div>
                      <div style={{ fontWeight: 600 }}>{result.blockchain.blockIndex}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase' }}>Data Hash (SHA-256)</div>
                      <div className="tx-hash">{result.certificate.hash}</div>
                    </div>
                    <div>
                      <span className="badge badge-emerald">✓ Chain Integrity Verified</span>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <a
                  href={certificatesAPI.download(result.certificate.certificateId)}
                  className="btn btn-primary"
                  target="_blank"
                  rel="noreferrer"
                >
                  📥 Download Certificate PDF
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
