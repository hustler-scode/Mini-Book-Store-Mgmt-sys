import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { UserCheck, Plus, CheckCircle2, AlertTriangle, Clock, ArrowRight, DollarSign } from 'lucide-react';

export default function LendingView({ showToast }) {
  const [subTab, setSubTab] = useState('active'); // 'active' | 'overdue' | 'all'
  const [lends, setLends] = useState([]);
  const [overdueLends, setOverdueLends] = useState([]);
  const [availableCopies, setAvailableCopies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [returnModalItem, setReturnModalItem] = useState(null);

  // Borrow Form
  const [borrowForm, setBorrowForm] = useState({
    book_copy_id: '',
    Lendedtofullname: '',
    lendedtophoneno: '',
    lendedtoemail: '',
    borrow_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lendedremark: 'Standard 14-day loan'
  });

  // Return Form
  const [returnForm, setReturnForm] = useState({
    returnremark: 'Returned in good condition',
    return_condition: '',
    custom_fine_amount: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allLendsRes, overdueRes, copiesRes] = await Promise.all([
        api.getLends(),
        api.getOverdueLends(),
        api.getCopies({ status: 'Available' })
      ]);
      setLends(allLendsRes.data || []);
      setOverdueLends(overdueRes.data || []);
      setAvailableCopies(copiesRes.data || []);
    } catch (err) {
      showToast('Error loading lending data: ' + err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBorrow = async (e) => {
    e.preventDefault();
    if (!borrowForm.book_copy_id) {
      showToast('Please select an available book copy to lend', 'danger');
      return;
    }
    try {
      await api.borrowBook(borrowForm);
      showToast('Book successfully lent out!', 'success');
      setShowBorrowModal(false);
      setBorrowForm({
        book_copy_id: '',
        Lendedtofullname: '',
        lendedtophoneno: '',
        lendedtoemail: '',
        borrow_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lendedremark: 'Standard 14-day loan'
      });
      fetchData();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    if (!returnModalItem) return;
    try {
      const payload = {
        returnremark: returnForm.returnremark
      };
      if (returnForm.return_condition) payload.return_condition = returnForm.return_condition;
      if (returnForm.custom_fine_amount !== '') payload.custom_fine_amount = returnForm.custom_fine_amount;

      const res = await api.returnBook(returnModalItem.id, payload);
      showToast(res.message || 'Book returned and physical copy is now Available!', 'success');
      setReturnModalItem(null);
      fetchData();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const activeLoans = lends.filter((l) => l.status === 'Lend');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Feature 3: Book Lending (Take-Home Borrowing)</h1>
          <p className="page-subtitle">
            Manage member checkout, return processing, simultaneous checkout prevention, and overdue fine generation.
          </p>
        </div>
        <div>
          <button onClick={() => setShowBorrowModal(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Borrow Book</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setSubTab('active')}
          className={`btn ${subTab === 'active' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <UserCheck size={16} />
          <span>Active Loans ({activeLoans.length})</span>
        </button>
        <button
          onClick={() => setSubTab('overdue')}
          className={`btn ${subTab === 'overdue' ? 'btn-danger' : 'btn-secondary'}`}
        >
          <AlertTriangle size={16} />
          <span>Overdue Loans ({overdueLends.length})</span>
        </button>
        <button
          onClick={() => setSubTab('all')}
          className={`btn ${subTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <span>All History ({lends.length})</span>
        </button>
      </div>

      {/* Table view */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <UserCheck size={20} color="#8b5cf6" />
            <span>
              {subTab === 'active' && 'Current Active Take-Home Loans'}
              {subTab === 'overdue' && 'Overdue Loans (Action Required)'}
              {subTab === 'all' && 'Complete Lending & Return History'}
            </span>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Loan #</th>
                  <th>Book Copy & Barcode</th>
                  <th>Borrower</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Fine / Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                      Loading loans...
                    </td>
                  </tr>
                ) : (subTab === 'overdue' ? overdueLends : (subTab === 'active' ? activeLoans : lends)).length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No loans found in this category.
                    </td>
                  </tr>
                ) : (
                  (subTab === 'overdue' ? overdueLends : (subTab === 'active' ? activeLoans : lends)).map((item) => {
                    const isOverdue = item.status === 'Lend' && new Date() > new Date(item.due_date);
                    return (
                      <tr key={item.id}>
                        <td>
                          <strong>#{item.id}</strong>
                        </td>
                        <td>
                          <strong>{item.bookCopy?.book?.title || 'Unknown Title'}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Barcode: <code>{item.bookCopy?.copy_number}</code>
                          </div>
                          <span className="badge badge-available" style={{ fontSize: '0.7rem' }}>
                            {item.bookCopy?.condition}
                          </span>
                        </td>
                        <td>
                          <strong>{item.Lendedtofullname}</strong>
                          {item.lendedtoemail && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {item.lendedtoemail}
                            </div>
                          )}
                          {item.lendedtophoneno && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {item.lendedtophoneno}
                            </div>
                          )}
                        </td>
                        <td>{new Date(item.borrow_date).toLocaleDateString()}</td>
                        <td>
                          <span style={{ fontWeight: isOverdue ? '700' : 'normal', color: isOverdue ? 'var(--danger)' : 'inherit' }}>
                            {new Date(item.due_date).toLocaleDateString()}
                          </span>
                          {isOverdue && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: '600' }}>
                              ⚠️ Past Due
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${item.status === 'Lend' ? (isOverdue ? 'badge-danger' : 'badge-checked_out_home') : 'badge-received'}`}>
                            {item.status === 'Lend' ? (isOverdue ? 'Overdue' : 'Active Loan') : 'Returned'}
                          </span>
                        </td>
                        <td>
                          {item.fine && (
                            <div style={{ fontSize: '0.8rem' }}>
                              <span className={`badge badge-${item.fine.status.toLowerCase()}`}>
                                Fine: ${parseFloat(item.fine.amount).toFixed(2)} ({item.fine.status})
                              </span>
                            </div>
                          )}
                          {item.returnremark && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {item.returnremark}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {item.status === 'Lend' ? (
                            <button
                              onClick={() => {
                                setReturnModalItem(item);
                                setReturnForm({
                                  returnremark: isOverdue ? 'Returned late to front desk' : 'Returned on time in good shape',
                                  return_condition: item.bookCopy?.condition || 'Good',
                                  custom_fine_amount: ''
                                });
                              }}
                              className="btn btn-success btn-sm"
                            >
                              <CheckCircle2 size={14} />
                              <span>Return Book</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                              Returned {item.return_date ? new Date(item.return_date).toLocaleDateString() : ''}
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

      {/* Borrow Modal */}
      {showBorrowModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Borrow Book (Take-Home)</h3>
              <button onClick={() => setShowBorrowModal(false)} className="modal-close">
                ✕
              </button>
            </div>
            <form onSubmit={handleBorrow}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Available Physical Copy *</label>
                  <select
                    required
                    className="form-control"
                    value={borrowForm.book_copy_id}
                    onChange={(e) => setBorrowForm({ ...borrowForm, book_copy_id: e.target.value })}
                  >
                    <option value="">Choose an available copy...</option>
                    {availableCopies.map((copy) => (
                      <option key={copy.id} value={copy.id}>
                        {copy.copy_number} — {copy.book?.title} (Condition: {copy.condition}, {copy.source_type})
                      </option>
                    ))}
                  </select>
                  {availableCopies.length === 0 && (
                    <small style={{ color: 'var(--danger)', marginTop: '0.25rem', display: 'block' }}>
                      No physical copies are currently in "Available" status.
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Borrower Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Alice Johnson"
                    value={borrowForm.Lendedtofullname}
                    onChange={(e) => setBorrowForm({ ...borrowForm, Lendedtofullname: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Borrower Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="alice@example.com"
                      value={borrowForm.lendedtoemail}
                      onChange={(e) => setBorrowForm({ ...borrowForm, lendedtoemail: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Borrower Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+1-555-0100"
                      value={borrowForm.lendedtophoneno}
                      onChange={(e) => setBorrowForm({ ...borrowForm, lendedtophoneno: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Borrow Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={borrowForm.borrow_date}
                      onChange={(e) => setBorrowForm({ ...borrowForm, borrow_date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date *</label>
                    <input
                      type="date"
                      required
                      className="form-control"
                      value={borrowForm.due_date}
                      onChange={(e) => setBorrowForm({ ...borrowForm, due_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Loan Remarks</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 14-day checkout"
                    value={borrowForm.lendedremark}
                    onChange={(e) => setBorrowForm({ ...borrowForm, lendedremark: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowBorrowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Checkout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnModalItem && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Process Book Return</h3>
              <button onClick={() => setReturnModalItem(null)} className="modal-close">
                ✕
              </button>
            </div>
            <form onSubmit={handleReturn}>
              <div className="modal-body">
                <div style={{ marginBottom: '1rem' }}>
                  <div><strong>Book:</strong> {returnModalItem.bookCopy?.book?.title}</div>
                  <div><strong>Barcode:</strong> {returnModalItem.bookCopy?.copy_number}</div>
                  <div><strong>Borrower:</strong> {returnModalItem.Lendedtofullname}</div>
                  <div><strong>Due Date:</strong> {new Date(returnModalItem.due_date).toLocaleDateString()}</div>
                </div>

                {new Date() > new Date(returnModalItem.due_date) && (
                  <div className="alert alert-danger">
                    <AlertTriangle size={18} />
                    <div>
                      This book is <strong>overdue</strong>. An overdue fine ($1.00/day) will be automatically generated upon return.
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Returned Physical Condition</label>
                  <select
                    className="form-control"
                    value={returnForm.return_condition}
                    onChange={(e) => setReturnForm({ ...returnForm, return_condition: e.target.value })}
                  >
                    <option value="">Keep current condition ({returnModalItem.bookCopy?.condition})</option>
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="Damaged">Damaged (Needs Maintenance)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Return Notes / Remark</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={returnForm.returnremark}
                    onChange={(e) => setReturnForm({ ...returnForm, returnremark: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setReturnModalItem(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Complete Return & Reshelve Copy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

