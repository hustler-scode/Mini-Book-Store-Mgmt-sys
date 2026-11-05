import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { BookMarked, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function InLibraryView({ showToast }) {
  const [subTab, setSubTab] = useState('active'); // 'active' | 'overdue' | 'all'
  const [sessions, setSessions] = useState([]);
  const [overdueSessions, setOverdueSessions] = useState([]);
  const [availableCopies, setAvailableCopies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showStartModal, setShowStartModal] = useState(false);
  const [returnModalItem, setReturnModalItem] = useState(null);
  const [returnRemark, setReturnRemark] = useState('');

  // Start Session Form
  const [sessionForm, setSessionForm] = useState({
    book_copy_id: '',
    user_fullname: '',
    user_email: '',
    user_phone: '',
    duration_hours: 2,
    receiveremark: 'Reading in main lounge area'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allSessionsRes, overdueRes, copiesRes] = await Promise.all([
        api.getInLibrarySessions(),
        api.getOverdueInLibrarySessions(),
        api.getCopies({ status: 'Available' })
      ]);
      setSessions(allSessionsRes.data || []);
      setOverdueSessions(overdueRes.data || []);
      setAvailableCopies(copiesRes.data || []);
    } catch (err) {
      showToast('Error loading in-library sessions: ' + err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!sessionForm.book_copy_id) {
      showToast('Please select an available book copy', 'danger');
      return;
    }
    try {
      await api.startInLibrarySession(sessionForm);
      showToast('In-library reading session opened! Copy marked In_Library_Use.', 'success');
      setShowStartModal(false);
      setSessionForm({
        book_copy_id: '',
        user_fullname: '',
        user_email: '',
        user_phone: '',
        duration_hours: 2,
        receiveremark: 'Reading in main lounge area'
      });
      fetchData();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleReturnSession = async () => {
    if (!returnModalItem) return;
    try {
      await api.returnInLibrarySession(returnModalItem.id, {
        returnremark: returnRemark || 'Returned to shelf safely'
      });
      showToast('Book returned to desk/shelf! Copy is now Available.', 'success');
      setReturnModalItem(null);
      setReturnRemark('');
      fetchData();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const activeSessions = sessions.filter((s) => s.status === 'Received');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Feature 4: In-Library Book Use (Reading Inside)</h1>
          <p className="page-subtitle">
            Track visitors and members reading inside the facility without taking books home. Real-time desk overdue tracking.
          </p>
        </div>
        <div>
          <button onClick={() => setShowStartModal(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Check Out For Desk Reading</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setSubTab('active')}
          className={`btn ${subTab === 'active' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <BookMarked size={16} />
          <span>Active Readers Now ({activeSessions.length})</span>
        </button>
        <button
          onClick={() => setSubTab('overdue')}
          className={`btn ${subTab === 'overdue' ? 'btn-danger' : 'btn-secondary'}`}
        >
          <Clock size={16} />
          <span>Desk Overdue Alerts ({overdueSessions.length})</span>
        </button>
        <button
          onClick={() => setSubTab('all')}
          className={`btn ${subTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <span>All Completed Sessions ({sessions.length})</span>
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <BookMarked size={20} color="#0284c7" />
            <span>
              {subTab === 'active' && 'Currently Reading Inside Library'}
              {subTab === 'overdue' && 'Desk Overdue Sessions (Follow-up Required)'}
              {subTab === 'all' && 'All Reading Session Records'}
            </span>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Session #</th>
                  <th>Book Copy</th>
                  <th>Reader / Visitor</th>
                  <th>Checkout Time</th>
                  <th>Expected Return</th>
                  <th>Status</th>
                  <th>Staff Remark</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                      Loading reading sessions...
                    </td>
                  </tr>
                ) : (subTab === 'overdue' ? overdueSessions : (subTab === 'active' ? activeSessions : sessions)).length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No sessions found in this category.
                    </td>
                  </tr>
                ) : (
                  (subTab === 'overdue' ? overdueSessions : (subTab === 'active' ? activeSessions : sessions)).map((s) => {
                    const isDeskOverdue = s.status === 'Desk_Overdue' || (s.status === 'Received' && new Date() > new Date(s.expected_return_time));
                    return (
                      <tr key={s.id}>
                        <td>
                          <strong>#{s.id}</strong>
                        </td>
                        <td>
                          <strong>{s.bookCopy?.book?.title || 'Unknown Title'}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Barcode: <code>{s.bookCopy?.copy_number}</code>
                          </div>
                        </td>
                        <td>
                          <strong>{s.user_fullname}</strong>
                          {s.user_phone && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {s.user_phone}
                            </div>
                          )}
                          {s.user_email && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {s.user_email}
                            </div>
                          )}
                        </td>
                        <td>{new Date(s.checkout_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>
                          <span style={{ fontWeight: isDeskOverdue ? '700' : 'normal', color: isDeskOverdue ? 'var(--danger)' : 'inherit' }}>
                            {new Date(s.expected_return_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isDeskOverdue && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: '600' }}>
                              ⚠️ Desk Overdue
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${s.status === 'Returned' ? 'badge-received' : (isDeskOverdue ? 'badge-danger' : 'badge-in_library_use')}`}>
                            {s.status === 'Returned' ? 'Returned to Desk' : (isDeskOverdue ? 'Desk Overdue' : 'Reading Inside')}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {s.returnremark || s.receiveremark}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {s.status !== 'Returned' ? (
                            <button
                              onClick={() => {
                                setReturnModalItem(s);
                                setReturnRemark('Returned to desk and verified intact.');
                              }}
                              className="btn btn-success btn-sm"
                              title="Return book to desk/shelf and reset status to Available"
                            >
                              <CheckCircle2 size={14} />
                              <span>Return to Desk</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                              ✓ Reshelved
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Start Session Modal */}
      {showStartModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Check Out Book For In-Library Reading</h3>
              <button onClick={() => setShowStartModal(false)} className="modal-close">
                ✕
              </button>
            </div>
            <form onSubmit={handleStartSession}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Available Physical Copy *</label>
                  <select
                    required
                    className="form-control"
                    value={sessionForm.book_copy_id}
                    onChange={(e) => setSessionForm({ ...sessionForm, book_copy_id: e.target.value })}
                  >
                    <option value="">Choose an available book copy...</option>
                    {availableCopies.map((copy) => (
                      <option key={copy.id} value={copy.id}>
                        {copy.copy_number} — {copy.book?.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Reader / Visitor Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. David Brown"
                    value={sessionForm.user_fullname}
                    onChange={(e) => setSessionForm({ ...sessionForm, user_fullname: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+1-555-0300"
                      value={sessionForm.user_phone}
                      onChange={(e) => setSessionForm({ ...sessionForm, user_phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (Hours) *</label>
                    <select
                      className="form-control"
                      value={sessionForm.duration_hours}
                      onChange={(e) => setSessionForm({ ...sessionForm, duration_hours: e.target.value })}
                    >
                      <option value="1">1 Hour</option>
                      <option value="2">2 Hours (Standard)</option>
                      <option value="3">3 Hours</option>
                      <option value="4">4 Hours (Half Day)</option>
                      <option value="8">8 Hours (Full Day)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes / Desk Location</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Study desk #14, 2nd floor"
                    value={sessionForm.receiveremark}
                    onChange={(e) => setSessionForm({ ...sessionForm, receiveremark: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowStartModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Start Reading Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return to Desk Modal */}
      {returnModalItem && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Return Book to Desk / Shelf</h3>
              <button onClick={() => setReturnModalItem(null)} className="modal-close">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '1rem' }}>
                Confirm return of <strong>{returnModalItem.bookCopy?.book?.title}</strong> (Barcode:{' '}
                <code>{returnModalItem.bookCopy?.copy_number}</code>) from reader{' '}
                <strong>{returnModalItem.user_fullname}</strong>.
              </p>

              <div className="form-group">
                <label className="form-label">Return Notes</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={returnRemark}
                  onChange={(e) => setReturnRemark(e.target.value)}
                  placeholder="e.g. Returned to desk. Pages in perfect shape."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setReturnModalItem(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleReturnSession} className="btn btn-success">
                Confirm Return & Reshelve Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

