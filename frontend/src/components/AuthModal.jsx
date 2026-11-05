import React, { useState } from 'react';
import { api } from '../api';
import { LogIn, UserPlus, X, KeyRound, Mail, User, Phone, Shield } from 'lucide-react';

export default function AuthModal({ onClose, onLoginSuccess, showToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: 'admin@library.com',
    password: 'AdminPassword123!',
    phone_number: '',
    isstaff: false,
    isvisitor: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        const res = await api.register(formData);
        localStorage.setItem('token', res.token);
        showToast('Registration successful!', 'success');
        onLoginSuccess(res.data);
      } else {
        const res = await api.login({ email: formData.email, password: formData.password });
        localStorage.setItem('token', res.token);
        showToast('Logged in successfully!', 'success');
        onLoginSuccess(res.data);
      }
      onClose();
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (email, password) => {
    setFormData({ ...formData, email, password });
    setIsRegister(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3 className="modal-title">
            {isRegister ? 'Create Account' : 'Sign In to Library System'}
          </h3>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    className="form-control"
                    style={{ paddingLeft: '36px' }}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {isRegister && (
              <>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="+1-555-0100"
                      className="form-control"
                      style={{ paddingLeft: '36px' }}
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.isstaff}
                      onChange={(e) => setFormData({ ...formData, isstaff: e.target.checked })}
                    />
                    <span>Library Staff Member</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.isvisitor}
                      onChange={(e) => setFormData({ ...formData, isvisitor: e.target.checked })}
                    />
                    <span>Visitor Account</span>
                  </label>
                </div>
              </>
            )}

            {!isRegister && (
              <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  QUICK FILL SAMPLE ACCOUNTS:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => fillQuickAccount('admin@library.com', 'AdminPassword123!')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickAccount('sarah.librarian@library.com', 'StaffPassword123!')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  >
                    Staff (Sarah)
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickAccount('alice.johnson@gmail.com', 'MemberPassword123!')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  >
                    Member (Alice)
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {isRegister ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

