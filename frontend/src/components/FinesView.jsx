import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { DollarSign, CheckCircle2, Filter } from 'lucide-react';

export default function FinesView({ showToast }) {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [payModalFine, setPayModalFine] = useState(null);
  const [paidRemark, setPaidRemark] = useState('Paid in cash at circulation desk');

  const fetchFines = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.getFines(params);
      setFines(res.data || []);
    } catch (err) {
      showToast('Error loading fines: ' + err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, [statusFilter]);

  const handlePayFine = async () => {
    if (!payModalFine) return;
    try {
      await api.payFine(payModalFine.id, {
        paidremark: paidRemark
      });
      showToast('Fine paid and cleared successfully!', 'success');
      setPayModalFine(null);
      fetchFines();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const totalUnpaid = fines
    .filter((f) => f.status === 'Unpaid')
    .reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);

  const totalPaid = fines
    .filter((f) => f.status === 'Paid')
    .reduce((sum, f) => sum + parseFloat(f.amount || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Overdue Fines & Payments</h1>
          <p className="page-subtitle">
            Track fines automatically generated from overdue take-home book returns.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-value">${totalUnpaid.toFixed(2)}</div>
            <div className="stat-label">Outstanding Unpaid Fines</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-value">${totalPaid.toFixed(2)}</div>
            <div className="stat-label">Settled / Collected Fines</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <DollarSign size={20} color="#ef4444" />
            <span>Fines Registry ({fines.length})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="">All Statuses</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Fine #</th>
                  <th>Loan & Book Title</th>
                  <th>Borrower</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      Loading fines...
                    </td>
                  </tr>
                ) : fines.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No fines recorded.
                    </td>
                  </tr>
                ) : (
                  fines.map((f) => (
                    <tr key={f.id}>
                      <td>#{f.id}</td>
                      <td>
                        <strong>{f.loan?.bookCopy?.book?.title || 'Unknown Title'}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Barcode: <code>{f.loan?.bookCopy?.copy_number}</code>
                        </div>
                      </td>
                      <td>
                        <strong>{f.loan?.Lendedtofullname || '—'}</strong>
                        {f.loan?.lendedtoemail && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {f.loan.lendedtoemail}
                          </div>
                        )}
                      </td>
                      <td>
                        <strong style={{ fontSize: '1rem', color: f.status === 'Unpaid' ? 'var(--danger)' : 'var(--success)' }}>
                          ${parseFloat(f.amount).toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <span className={`badge badge-${f.status.toLowerCase()}`}>{f.status}</span>
                      </td>
                      <td>
                        {f.status === 'Paid' ? (
                          <div style={{ fontSize: '0.8rem' }}>
                            <span style={{ color: 'var(--success)' }}>✓ {f.paidremark}</span>
                            {f.paidat && (
                              <div style={{ color: 'var(--text-muted)' }}>
                                on {new Date(f.paidat).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>
                            Outstanding balance
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {f.status === 'Unpaid' ? (
                          <button
                            onClick={() => {
                              setPayModalFine(f);
                              setPaidRemark('Paid in cash at circulation desk');
                            }}
                            className="btn btn-success btn-sm"
                          >
                            <DollarSign size={14} />
                            <span>Mark Paid</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '600' }}>
                            ✓ Cleared
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pay Fine Modal */}
      {payModalFine && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Record Fine Payment</h3>
              <button onClick={() => setPayModalFine(null)} className="modal-close">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1rem' }}>
                <div><strong>Borrower:</strong> {payModalFine.loan?.Lendedtofullname}</div>
                <div><strong>Book:</strong> {payModalFine.loan?.bookCopy?.book?.title}</div>
                <div style={{ fontSize: '1.25rem', marginTop: '0.5rem', color: 'var(--primary-dark)', fontWeight: '700' }}>
                  Amount: ${parseFloat(payModalFine.amount).toFixed(2)}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method / Receipt Notes</label>
                <input
                  type="text"
                  className="form-control"
                  value={paidRemark}
                  onChange={(e) => setPaidRemark(e.target.value)}
                  placeholder="e.g. Paid via Visa credit card #4111"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setPayModalFine(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handlePayFine} className="btn btn-success">
                Confirm Settlement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

