import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">⛓️ Powered by Blockchain Technology</div>
          <h1>
            Tamper-Proof<br />
            <span className="gradient-text">Digital Certificates</span><br />
            for Your Events
          </h1>
          <p>
            Issue, manage, and verify event certificates with blockchain-backed security. 
            Every certificate gets a unique hash stored on the blockchain — making forgery impossible 
            and verification instant.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/admin" className="btn btn-primary btn-lg">Go to Dashboard →</Link>
            ) : (
              <Link to="/login" className="btn btn-primary btn-lg">Get Started →</Link>
            )}
            <Link to="/verify" className="btn btn-secondary btn-lg">Verify a Certificate</Link>
          </div>
        </div>
      </section>

      <section className="features-grid">
        <div className="card feature-card">
          <div className="feature-icon">🛡️</div>
          <h3>Blockchain Secured</h3>
          <p>Every certificate hash is stored on a tamper-proof blockchain ledger, ensuring authenticity that cannot be forged.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon">📄</div>
          <h3>PDF Generation</h3>
          <p>Beautiful, professional PDFs are generated automatically with QR codes for instant mobile verification.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon">✅</div>
          <h3>Instant Verification</h3>
          <p>Anyone can verify a certificate's authenticity in seconds by scanning its QR code or entering the certificate ID.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon">📊</div>
          <h3>Admin Dashboard</h3>
          <p>Manage events, upload participant lists via CSV, and track all issued certificates from a single dashboard.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon">📧</div>
          <h3>Bulk Operations</h3>
          <p>Upload hundreds of participants via CSV and generate all certificates in one click with blockchain verification.</p>
        </div>
        <div className="card feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Search & Track</h3>
          <p>Search certificates by name, ID, or email. View complete activity logs and analytics for your organization.</p>
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>© 2024 CertChain — Blockchain Certificate Generator. Built with ❤️ for secure credentialing.</p>
      </footer>
    </>
  );
}
