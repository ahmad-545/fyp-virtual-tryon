import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AdminDataContext } from '../context/AdminContext';
import { AuthDataContext } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';


const AdminLogin = () => {
  const { serverUrl } = useContext(AuthDataContext);
  const { getAdmin, setAdminData } = useContext(AdminDataContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${serverUrl}/api/admin/login`,
        formData,
        { withCredentials: true }
      );
      if (res.data.token) {
        localStorage.setItem('adminToken', res.data.token);
        setAdminData(res.data.admin);
        getAdmin();
        navigate('/admin');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid Credentials!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>

      {/* ─── LEFT PANEL: Form ─── */}
      <div style={styles.leftPanel}>

        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>
            <ShieldCheck size={22} color="#C19A6B" />
          </div>
          <span style={styles.logoText}>Trylo Admin</span>
        </div>

        {/* Heading */}
        <div style={styles.headingBlock}>
          <h1 style={styles.heading}>Welcome back</h1>
          <p style={styles.subheading}>
            Sign in to access your secure management portal.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Email */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Email <span style={styles.required}>*</span>
            </label>
            <div style={styles.inputWrap}>
              <Mail size={16} color="#9ca3af" style={styles.inputIcon} />
              <input
                id="admin-email"
                name="email"
                type="email"
                placeholder="admin@trylo.store"
                onChange={handleChange}
                required
                style={styles.input}
                onFocus={e => (e.target.style.borderColor = '#C19A6B')}
                onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Password <span style={styles.required}>*</span>
            </label>
            <div style={styles.inputWrap}>
              <Lock size={16} color="#9ca3af" style={styles.inputIcon} />
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                onChange={handleChange}
                required
                style={{ ...styles.input, paddingRight: '44px' }}
                onFocus={e => (e.target.style.borderColor = '#C19A6B')}
                onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword
                  ? <EyeOff size={16} color="#9ca3af" />
                  : <Eye size={16} color="#9ca3af" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="admin-login-btn"
            type="submit"
            disabled={loading}
            style={styles.submitBtn}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#b08456'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = '#C19A6B'; }}
          >
            {loading ? (
              <span style={styles.loadingRow}>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Authenticating...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Footer */}
        <p style={styles.footer}>© 2026 Trylo · Protected Admin Environment</p>
      </div>

      {/* ─── RIGHT PANEL: Video ─── */}
      <div style={styles.rightPanel}>
        {/* Gradient overlay so text is readable */}
        <div style={styles.videoOverlay} />

        {/* Autoplay background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          style={styles.video}
        >
          <source src="/videos/video1.mp4" type="video/mp4" />
        </video>

        {/* Content on top of video */}
        <div style={styles.videoContent}>
          <p style={styles.videoTag}>SECURE · POWERFUL · ELEGANT</p>
          <h2 style={styles.videoHeading}>
            {'Manage your store,\nyour way.'}
          </h2>
          <p style={styles.videoDesc}>
            Full control over products, orders, customers,
            and analytics — all in one place.
          </p>

          <div style={styles.featureList}>
            {[
              'Real-time order tracking',
              'Inventory & product management',
              'Customer insights & analytics',
            ].map((feat, i) => (
              <div key={i} style={styles.featureItem}>
                <span style={styles.featureDot} />
                <span style={styles.featureText}>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

/* ─── Inline Styles ─── */
const styles = {
  /* Wrapper */
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    backgroundColor: '#ffffff',
  },

  /* ── Left ── */
  leftPanel: {
    width: '460px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '48px 52px',
    backgroundColor: '#ffffff',
    position: 'relative',
    zIndex: 10,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '44px',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#fdf4eb',
    border: '1px solid #f0e0c8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    letterSpacing: '-0.3px',
  },
  headingBlock: {
    marginBottom: '32px',
  },
  heading: {
    fontSize: '30px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  subheading: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    lineHeight: 1.6,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
  },
  required: { color: '#ef4444' },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 40px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#111827',
    backgroundColor: '#f9fafb',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  submitBtn: {
    width: '100%',
    padding: '13px',
    backgroundColor: '#C19A6B',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '4px',
  },
  loadingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  footer: {
    marginTop: '36px',
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center',
  },

  /* ── Right ── */
  rightPanel: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  videoOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.05) 100%)',
    zIndex: 1,
  },
  videoContent: {
    position: 'relative',
    zIndex: 2,
    padding: '60px 52px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    height: '100%',
    boxSizing: 'border-box',
  },
  videoTag: {
    fontSize: '11px',
    letterSpacing: '0.25em',
    color: 'rgba(255,255,255,0.60)',
    fontWeight: '600',
    marginBottom: '14px',
    fontFamily: 'monospace',
  },
  videoHeading: {
    fontSize: '40px',
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 1.2,
    margin: '0 0 16px 0',
    whiteSpace: 'pre-line',
    letterSpacing: '-0.5px',
  },
  videoDesc: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 1.7,
    margin: '0 0 32px 0',
    maxWidth: '400px',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  featureDot: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.25)',
    flexShrink: 0,
  },
  featureText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.82)',
  },
};

export default AdminLogin;