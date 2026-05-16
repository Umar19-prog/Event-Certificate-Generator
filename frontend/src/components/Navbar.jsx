import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, admin, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="logo-icon">⛓</div>
        CertChain
      </Link>

      <ul className="navbar-links">
        <li>
          <Link to="/verify" className={isActive('/verify') ? 'nav-active' : ''}>
            🔍 Verify
          </Link>
        </li>

        {isAuthenticated ? (
          <>
            <li>
              <Link to="/admin" className={location.pathname === '/admin' ? 'nav-active' : ''}>
                📊 Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/events" className={isActive('/admin/events') ? 'nav-active' : ''}>
                📅 Events
              </Link>
            </li>
            <li>
              <Link to="/admin/certificates" className={isActive('/admin/certificates') ? 'nav-active' : ''}>
                📜 Certificates
              </Link>
            </li>
            <li>
              <button onClick={logout} title={`Logged in as ${admin?.name}`}>
                🚪 Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login" className={isActive('/login') ? 'nav-active' : ''}>
              🔐 Admin Login
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
