import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default function AdminLogin() {
  /* =====================================================
     AUTH STATE
  ===================================================== */

  const [isSignedIn, setIsSignedIn] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* =====================================================
     ENQUIRY STATE
  ===================================================== */

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] =
    useState(false);
  const [bookingError, setBookingError] = useState('');

  /* =====================================================
     IMPORTANT:
     
     EVERY TIME /enquiry-board IS OPENED,
     SHOW SIGN-IN FORM FIRST.
     
     We intentionally DO NOT restore the previous
     localStorage login session here.
  ===================================================== */

  useEffect(() => {
    localStorage.removeItem('shadow_admin');

    setIsSignedIn(false);
  }, []);

  /* =====================================================
     FETCH BOOKINGS AFTER LOGIN
  ===================================================== */

  useEffect(() => {
    if (isSignedIn) {
      fetchBookings();
    }
  }, [isSignedIn]);

  /* =====================================================
     FETCH BOOKINGS
  ===================================================== */

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      setBookingError('');

      const response = await fetch(
        `${API_URL}/bookings`,
        {
          method: 'GET',

          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message ||
            'Unable to load enquiries.'
        );
      }

      setBookings(result.data || []);
    } catch (error) {
      console.error(
        'Bookings error:',
        error
      );

      setBookingError(
        error.message ||
          'Unable to load enquiries.'
      );
    } finally {
      setLoadingBookings(false);
    }
  };

  /* =====================================================
     LOGIN
  ===================================================== */

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');

    if (!username.trim() || !password) {
      setError(
        'Username and password are required.'
      );

      return;
    }

    if (!SUPABASE_PUBLISHABLE_KEY) {
      setError(
        'Supabase configuration is missing.'
      );

      console.error(
        'VITE_SUPABASE_PUBLISHABLE_KEY is missing.'
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/admin-login`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_PUBLISHABLE_KEY,
          },

          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setError(
          result.message ||
            'Invalid username or password.'
        );

        return;
      }

      /* ===============================================
         LOGIN SUCCESS
      =============================================== */

      localStorage.setItem(
        'shadow_admin',
        JSON.stringify(result.user)
      );

      setUsername('');
      setPassword('');
      setError('');

      /*
       * DO NOT REDIRECT.
       *
       * Stay on /enquiry-board and display
       * the enquiry board.
       */

      setIsSignedIn(true);

    } catch (error) {
      console.error(
        'Admin login error:',
        error
      );

      setError(
        'Unable to connect to the server. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem(
      'shadow_admin'
    );

    setIsSignedIn(false);

    setBookings([]);
    setUsername('');
    setPassword('');
    setError('');
    setBookingError('');
  };

  /* =====================================================
     SIGN-IN PAGE
  ===================================================== */

  if (!isSignedIn) {
    return (
      <div style={styles.authContainer}>

        {/* LOGO */}

        <a
          href="/"
          style={styles.logoAnchor}
        >
          <img
            src="/images/logo.png"
            alt="Shadow Tour Packages"
            style={styles.loginLogo}
          />
        </a>

        {/* LOGIN CARD */}

        <div style={styles.authCard}>

          <div
            style={{
              textAlign: 'center',
              marginBottom: '22px',
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: '22px',
                color: '#1a202c',
                fontWeight: 700,
              }}
            >
              Shadow Tour Packages
            </h1>

            <p
              style={{
                margin: '6px 0 0',
                fontSize: '13px',
                color: '#718096',
              }}
            >
              Admin Login
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <div style={styles.errorAlert}>
              {error}
            </div>
          )}

          {/* LOGIN FORM */}

          <form
            onSubmit={handleLogin}
            style={styles.form}
          >

            {/* USERNAME */}

            <label style={styles.label}>
              Username

              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Enter username"
                autoComplete="username"
                disabled={loading}
                style={styles.input}
              />
            </label>

            {/* PASSWORD */}

            <label style={styles.label}>
              Password

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={loading}
                style={styles.input}
              />
            </label>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              {loading
                ? 'Signing in...'
                : 'Sign In'}
            </button>

          </form>

          {/* RETURN TO WEBSITE */}

          <a
            href="/"
            style={styles.returnLink}
          >
            ← Return to website
          </a>

        </div>
      </div>
    );
  }

  /* =====================================================
     ENQUIRY BOARD
  ===================================================== */

  return (
    <div style={styles.pageWrap}>

      {/* =================================================
          HEADER
      ================================================= */}

      <header style={styles.header}>

        <div style={styles.headerInner}>

          {/* BACK */}

          <a
            href="/"
            style={styles.backButton}
          >
            ← Back to Website
          </a>

          {/* LOGO */}

          <a
            href="/"
            style={styles.centerLogoLink}
          >
            <img
              src="/images/logo.png"
              alt="Shadow Tour Packages"
              style={styles.dashLogo}
            />
          </a>

          {/* HEADER RIGHT */}

          <div style={styles.headerRight}>

            <button
              type="button"
              onClick={fetchBookings}
              disabled={loadingBookings}
              style={styles.iconBtn}
            >
              {loadingBookings
                ? 'Refreshing...'
                : 'Refresh'}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              style={styles.logoutBtn}
            >
              Logout
            </button>

          </div>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main style={styles.main}>

        <div style={styles.titleRow}>

          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 700,
            }}
          >
            Customer Enquiries
          </h1>

          <p
            style={{
              margin: '6px 0 0',
              color: '#718096',
              fontSize: '14px',
            }}
          >
            Manage customer tour enquiries.
          </p>

        </div>

        {/* BOOKING ERROR */}

        {bookingError && (
          <div style={styles.errorAlert}>
            {bookingError}
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loadingBookings ? (

          <div style={styles.centerNotice}>
            Loading enquiries...
          </div>

        ) : bookings.length === 0 ? (

          /* =================================================
             EMPTY
          ================================================= */

          <div style={styles.centerNotice}>
            No enquiries found.
          </div>

        ) : (

          /* =================================================
             BOOKINGS TABLE
          ================================================= */

          <div style={styles.tableCard}>

            <table style={styles.table}>

              <thead>

                <tr>

                  <th style={styles.th}>
                    Reference
                  </th>

                  <th style={styles.th}>
                    Customer
                  </th>

                  <th style={styles.th}>
                    Destination
                  </th>

                  <th style={styles.th}>
                    Category
                  </th>

                  <th style={styles.th}>
                    Travellers
                  </th>

                  <th style={styles.th}>
                    Travel Date
                  </th>

                  <th style={styles.th}>
                    Email Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {bookings.map((booking) => (

                  <tr
                    key={
                      booking._id ||
                      booking.id ||
                      booking.booking_reference
                    }
                    style={styles.tr}
                  >

                    {/* REFERENCE */}

                    <td style={styles.td}>

                      <span
                        style={styles.refPill}
                      >
                        {booking.booking_reference ||
                          'N/A'}
                      </span>

                    </td>

                    {/* CUSTOMER */}

                    <td style={styles.td}>

                      <strong>
                        {booking.name ||
                          'N/A'}
                      </strong>

                      <div
                        style={styles.infoLine}
                      >
                        <a
                          href={`tel:${booking.phone}`}
                          style={styles.link}
                        >
                          {booking.phone ||
                            'No phone'}
                        </a>
                      </div>

                      {booking.email && (
                        <div
                          style={styles.infoLine}
                        >
                          <a
                            href={`mailto:${booking.email}`}
                            style={styles.link}
                          >
                            {booking.email}
                          </a>
                        </div>
                      )}

                    </td>

                    {/* DESTINATION */}

                    <td style={styles.td}>
                      {booking.destination ||
                        'N/A'}
                    </td>

                    {/* CATEGORY */}

                    <td style={styles.td}>
                      {booking.category ||
                        'N/A'}
                    </td>

                    {/* TRAVELLERS */}

                    <td style={styles.td}>
                      {booking.travellers ||
                        1}
                    </td>

                    {/* TRAVEL DATE */}

                    <td style={styles.td}>

                      {booking.travel_date
                        ? new Date(
                            booking.travel_date
                          ).toLocaleDateString(
                            'en-IN',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }
                          )
                        : 'Not specified'}

                    </td>

                    {/* EMAIL STATUS */}

                    <td style={styles.td}>

                      {booking.emailNotificationStatus ===
                      'sent' ? (

                        <span
                          style={
                            styles.badgeSent
                          }
                        >
                          ✓ Sent
                        </span>

                      ) : (

                        <span
                          style={
                            styles.badgePending
                          }
                        >
                          {booking.emailNotificationStatus ||
                            'Pending'}
                        </span>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </main>

    </div>
  );
}

/* =====================================================
   STYLES
===================================================== */

const styles = {
  /* ===================================================
     LOGIN
  =================================================== */

  authContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    padding: '20px',
    boxSizing: 'border-box',
  },

  logoAnchor: {
    display: 'inline-block',
    marginBottom: '20px',
  },

  loginLogo: {
    height: '80px',
    objectFit: 'contain',
  },

  authCard: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '380px',
    borderRadius: '12px',
    padding: '28px',
    boxShadow:
      '0 10px 25px rgba(0,0,0,0.3)',
    boxSizing: 'border-box',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },

  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#4a5568',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },

  input: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e0',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    color: '#1a202c',
  },

  submitBtn: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '11px',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },

  returnLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '18px',
    color: '#718096',
    fontSize: '13px',
    textDecoration: 'none',
  },

  errorAlert: {
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '18px',
    border: '1px solid #fecaca',
    fontSize: '14px',
  },

  /* ===================================================
     ENQUIRY BOARD
  =================================================== */

  pageWrap: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    color: '#1a202c',
    fontFamily:
      'system-ui, -apple-system, sans-serif',
  },

  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '10px 24px',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  },

  headerInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  centerLogoLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dashLogo: {
    height: '52px',
    objectFit: 'contain',
  },

  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    textDecoration: 'none',
    color: '#4a5568',
    fontSize: '13px',
    fontWeight: 500,
  },

  headerRight: {
    width: '180px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
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
    fontSize: '12px',
  },

  logoutBtn: {
    padding: '7px 12px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
  },

  main: {
    maxWidth: '1200px',
    margin: '28px auto',
    padding: '0 20px',
  },

  titleRow: {
    marginBottom: '24px',
  },

  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    overflowX: 'auto',
    boxShadow:
      '0 1px 3px rgba(0,0,0,0.03)',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '14px',
  },

  th: {
    backgroundColor: '#f8fafc',
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
    fontWeight: 600,
    color: '#4a5568',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
  },

  tr: {
    borderBottom: '1px solid #f1f5f9',
  },

  td: {
    padding: '14px 16px',
    verticalAlign: 'middle',
  },

  refPill: {
    fontFamily: 'monospace',
    fontWeight: 700,
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
  },

  infoLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    marginTop: '3px',
  },

  link: {
    color: '#2563eb',
    textDecoration: 'none',
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
    fontWeight: 600,
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
    fontWeight: 600,
  },

  centerNotice: {
    textAlign: 'center',
    padding: '50px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    color: '#94a3b8',
    border: '1px dashed #cbd5e1',
  },
};