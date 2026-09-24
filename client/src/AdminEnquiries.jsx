import { useState, useEffect } from 'react';
import { ArrowLeft, Lock, RefreshCw, Calendar, Phone, Mail, Users, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminEnquiries() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem('admin_logged_in') === 'true'
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const fetchEnquiries = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch(`${API_BASE}/bookings`);
      const result = await res.json();
      if (res.ok && result.ok) {
        setEnquiries(result.data || []);
      } else {
        setFetchError(result.message || 'Failed to fetch enquiries.');
      }
    } catch {
      setFetchError('Could not reach the server. Make sure your backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchEnquiries();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Default credentials: admin / shadow123
    if (username === 'admin' && password === 'shadow123') {
      sessionStorage.setItem('admin_logged_in', 'true');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    setIsAuthenticated(false);
  };

  // Group entries by Day & Date (e.g., "Sunday, 1 Feb 2026")
  const groupedEnquiries = enquiries.reduce((acc, item) => {
    const rawDate = item.createdAt ? new Date(item.createdAt) : new Date();
    const dateLabel = rawDate.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    if (!acc[dateLabel]) {
      acc[dateLabel] = [];
    }
    acc[dateLabel].push(item);
    return acc;
  }, {});

  // 1. LOGIN VIEW
  if (!isAuthenticated) {
    return (
      <div style={styles.authContainer}>
        {/* Top Centered Logo Redirects to Website */}
        <a href="/" style={styles.logoAnchor} title="Back to Shadow Tours">
          <img src="/images/logo.png" alt="Shadow Tour Packages" style={styles.loginLogo} />
        </a>

        <div style={styles.authCard}>
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <Lock size={30} color="#3182ce" />
            <h2 style={{ margin: '8px 0 2px', color: '#1a202c', fontSize: '20px' }}>Admin Portal</h2>
            <p style={{ margin: 0, color: '#718096', fontSize: '13px' }}>Sign in to view submitted enquiries</p>
          </div>

          {authError && <div style={styles.errorAlert}>{authError}</div>}

          <form onSubmit={handleLogin} style={styles.form}>
            <label style={styles.label}>
              Username
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={styles.input}
                placeholder="admin"
              />
            </label>
            <label style={styles.label}>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                placeholder="••••••••"
              />
            </label>
            <button type="submit" style={styles.submitBtn}>
              Sign In
            </button>
          </form>

          <a href="/" style={styles.returnLink}>
            <ArrowLeft size={15} /> Return to Shadow Tours Website
          </a>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD VIEW
  return (
    <div style={styles.pageWrap}>
      {/* Top Header with Centered Logo */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={{ width: '120px' }}>
            <a href="/" style={styles.backButton}>
              <ArrowLeft size={16} /> Home
            </a>
          </div>

          {/* Centered Logo Redirecting to Main Site */}
          <a href="/" title="Go to Home" style={styles.centerLogoLink}>
            <img src="/images/logo.png" alt="Shadow Tour Packages" style={styles.dashLogo} />
          </a>

          <div style={styles.headerRight}>
            <button onClick={fetchEnquiries} style={styles.iconBtn} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
            </button>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Table Area */}
      <main style={styles.main}>
        <div style={styles.titleRow}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', color: '#1a202c' }}>Enquiry Log</h1>
            <p style={{ margin: '4px 0 0', color: '#718096', fontSize: '13px' }}>
              Grouped chronologically by date received
            </p>
          </div>
        </div>

        {fetchError && <div style={styles.errorAlert}>{fetchError}</div>}

        {loading && enquiries.length === 0 ? (
          <div style={styles.centerNotice}>Fetching records...</div>
        ) : Object.keys(groupedEnquiries).length === 0 ? (
          <div style={styles.centerNotice}>No customer enquiries found.</div>
        ) : (
          Object.entries(groupedEnquiries).map(([dateStr, items]) => (
            <div key={dateStr} style={styles.dateBlock}>
              {/* Group Header */}
              <div style={styles.groupHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} color="#2b6cb0" />
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#2d3748' }}>{dateStr}</h3>
                </div>
                <span style={styles.countPill}>
                  {items.length} {items.length === 1 ? 'Enquiry' : 'Enquiries'}
                </span>
              </div>

              {/* Data Table */}
              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Reference</th>
                      <th style={styles.th}>Customer</th>
                      <th style={styles.th}>Destination</th>
                      <th style={styles.th}>Travellers</th>
                      <th style={styles.th}>Travel Date</th>
                      <th style={styles.th}>Notification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((enq) => (
                      <tr key={enq._id || enq.bookingReference} style={styles.tr}>
                        <td style={styles.td}>
                          <span style={styles.refPill}>{enq.bookingReference || 'N/A'}</span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: 600, color: '#1a202c' }}>{enq.name}</div>
                          <div style={styles.infoLine}>
                            <Phone size={12} color="#718096" />
                            <a href={`tel:${enq.phone}`} style={styles.link}>{enq.phone}</a>
                          </div>
                          <div style={styles.infoLine}>
                            <Mail size={12} color="#718096" />
                            {enq.email ? (
                              <a href={`mailto:${enq.email}`} style={styles.link}>{enq.email}</a>
                            ) : (
                              <span style={{ color: '#a0aec0', fontStyle: 'italic', fontSize: '12px' }}>Not provided</span>
                            )}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', textTransform: 'capitalize' }}>
                            <MapPin size={14} color="#e53e3e" />
                            {enq.destination}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Users size={14} color="#718096" />
                            {enq.travellers}
                          </div>
                        </td>
                        <td style={styles.td}>
                          {enq.travelDate ? (
                            new Date(enq.travelDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })
                          ) : (
                            <span style={{ color: '#a0aec0' }}>Flexible</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          {enq.emailNotificationStatus === 'sent' ? (
                            <span style={styles.badgeSent}><CheckCircle size={13} /> Dispatched</span>
                          ) : (
                            <span style={styles.badgePending}><AlertCircle size={13} /> {enq.emailNotificationStatus || 'Pending'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

const styles = {
  authContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    padding: '20px'
  },
  logoAnchor: {
    display: 'inline-block',
    marginBottom: '20px'
  },
  loginLogo: {
    height: '80px',
    objectFit: 'contain'
  },
  authCard: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '380px',
    borderRadius: '12px',
    padding: '28px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#4a5568',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  input: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e0',
    fontSize: '14px',
    outline: 'none'
  },
  submitBtn: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '11px',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '6px'
  },
  returnLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '18px',
    color: '#718096',
    fontSize: '13px',
    textDecoration: 'none'
  },
  pageWrap: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    color: '#1a202c',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '10px 24px',
    position: 'sticky',
    top: 0,
    zIndex: 20
  },
  headerInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  centerLogoLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dashLogo: {
    height: '52px',
    objectFit: 'contain'
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    textDecoration: 'none',
    color: '#4a5568',
    fontSize: '13px',
    fontWeight: 500
  },
  headerRight: {
    width: '180px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  iconBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '7px 12px',
    backgroundColor: '#edf2f7',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  logoutBtn: {
    padding: '7px 12px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600
  },
  main: {
    maxWidth: '1200px',
    margin: '28px auto',
    padding: '0 20px'
  },
  titleRow: {
    marginBottom: '24px'
  },
  dateBlock: {
    marginBottom: '32px'
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
    padding: '0 4px'
  },
  countPill: {
    backgroundColor: '#e2e8f0',
    color: '#4a5568',
    fontSize: '12px',
    fontWeight: 600,
    padding: '2px 10px',
    borderRadius: '12px'
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    overflowX: 'auto',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '14px'
  },
  th: {
    backgroundColor: '#f8fafc',
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
    fontWeight: 600,
    color: '#4a5568',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9'
  },
  td: {
    padding: '14px 16px',
    verticalAlign: 'middle'
  },
  refPill: {
    fontFamily: 'monospace',
    fontWeight: 700,
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px'
  },
  infoLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    marginTop: '3px'
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none'
  },
  badgeSent: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: '#15803d',
    backgroundColor: '#f0fdf4',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600
  },
  badgePending: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: '#b45309',
    backgroundColor: '#fffbeb',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600
  },
  errorAlert: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '18px',
    border: '1px solid #fecaca',
    fontSize: '14px'
  },
  centerNotice: {
    textAlign: 'center',
    padding: '50px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    color: '#94a3b8',
    border: '1px dashed #cbd5e1'
  }
};