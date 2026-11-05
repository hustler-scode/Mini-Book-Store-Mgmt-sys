import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { HeartHandshake, Plus, Check, X, Trash2, Filter } from 'lucide-react';

export default function DonationsView({ showToast }) {
  const [donations, setDonations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [approveModalItem, setApproveModalItem] = useState(null);
  const [rejectModalItem, setRejectModalItem] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    donor_name: '',
    donor_email: '',
    donor_phone: '',
    book_title: '',
    author: '',
    category_id: '',
    quantity: 1,
    condition: 'Good',
    requestremark: ''
  });
  const [approvalRemark, setApprovalRemark] = useState('');
  const [rejectRemark, setRejectRemark] = useState('');
  const [removeOnReject, setRemoveOnReject] = useState(false);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.getDonations(params);
      setDonations(res.data || []);
    } catch (err) {
      showToast('Error loading donations: ' + err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(res.data || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchDonations();
    fetchCategories();
  }, [statusFilter]);

  const handleSubmitDonation = async (e) => {
    e.preventDefault();
    try {
      await api.createDonation(formData);
      showToast('Donation request submitted successfully!', 'success');
      setShowSubmitModal(false);
      setFormData({
        donor_name: '',
        donor_email: '',
        donor_phone: '',
        book_title: '',
        author: '',
        category_id: '',
        quantity: 1,
        condition: 'Good',
        requestremark: ''
      });
      fetchDonations();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleApprove = async () => {
    if (!approveModalItem) return;
    try {
      const res = await api.approveDonation(approveModalItem.id, {
        approvalremark: approvalRemark || 'Approved and inventory updated'
      });
      showToast(res.message || 'Donation approved and book copies added to inventory!', 'success');
      setApproveModalItem(null);
      setApprovalRemark('');
      fetchDonations();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleReject = async () => {
    if (!rejectModalItem) return;
    try {
      const res = await api.rejectDonation(rejectModalItem.id, {
        rejectremark: rejectRemark || 'Declined by staff',
        remove_record: removeOnReject
      });
      showToast(res.message || 'Donation request processed', 'success');
      setRejectModalItem(null);
      setRejectRemark('');
      setRemoveOnReject(false);
      fetchDonations();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this donation record?')) return;
    try {
      await api.deleteDonation(id);
      showToast('Donation record removed', 'success');
      fetchDonations();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Feature 1: Book Receiving (Donations)</h1>
          <p className="page-subtitle">
            Community members contribute books. When approved by staff, books and physical inventory copies are automatically created.
          </p>
        </div>
        <div>
          <button onClick={() => setShowSubmitModal(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Submit Donation Request</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <HeartHandshake size={20} color="#f59e0b" />
            <span>Donation Requests ({donations.length})</span>
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
              <option value="requested">Pending (requested)</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Donor Info</th>
                  <th>Book Details</th>
                  <th>Qty / Condition</th>
                  <th>Status</th>
                  <th>Remarks / Staff</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      Loading donation requests...
                    </td>
                  </tr>
                ) : donations.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No donation requests found for this filter.
                    </td>
                  </tr>
                ) : (
                  donations.map((item) => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>
                      <td>
                        <strong>{item.donor_name}</strong>
                        {item.donor_email && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {item.donor_email}
                          </div>
                        )}
                        {item.donor_phone && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {item.donor_phone}
                          </div>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--primary-dark)' }}>{item.book_title}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          by {item.author}
                        </div>
                        {item.category && (
                          <span className="badge badge-ordered" style={{ marginTop: '0.25rem' }}>
                            {item.category.name}
                          </span>
                        )}
                      </td>
                      <td>
                        <div>
                          <strong>{item.quantity}</strong> copy/copies
                        </div>
                        <span className="badge badge-available" style={{ fontSize: '0.7rem' }}>
                          {item.condition} condition
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.status === 'requested' && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {item.requestremark || 'Awaiting staff review'}
                          </span>
                        )}
                        {item.status === 'Approved' && (
                          <div style={{ fontSize: '0.8rem' }}>
                            <div style={{ color: 'var(--success)', fontWeight: '600' }}>
                              ✓ {item.approvalremark}
                            </div>
                            {item.approvedBy && (
                              <div style={{ color: 'var(--text-muted)' }}>
                                by {item.approvedBy.name}
                              </div>
                            )}
                          </div>
                        )}
                        {item.status === 'Rejected' && (
                          <div style={{ fontSize: '0.8rem' }}>
                            <div style={{ color: 'var(--danger)', fontWeight: '600' }}>
                              ✕ {item.rejectremark}
                            </div>
                            {item.rejectedBy && (
                              <div style={{ color: 'var(--text-muted)' }}>
                                by {item.rejectedBy.name}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {item.status === 'requested' ? (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            <button
                              onClick={() => {
                                setApproveModalItem(item);
                                setApprovalRemark('Approved for library shelves.');
                              }}
                              className="btn btn-success btn-sm"
                              title="Approve and automatically add to inventory"
                            >
                              <Check size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => {
                                setRejectModalItem(item);
                                setRejectRemark('Does not meet library collection policy.');
                              }}
                              className="btn btn-danger btn-sm"
                              title="Reject donation"
                            >
                              <X size={14} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="btn btn-secondary btn-sm"
                            title="Delete record"
                          >
                            <Trash2 size={14} color="#ef4444" />
                          </button>
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

      {/* Submit Donation Modal */}
      {showSubmitModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Contribute Books (Donation)</h3>
              <button onClick={() => setShowSubmitModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitDonation}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Donor Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Alice Smith"
                      value={formData.donor_name}
                      onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Donor Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="alice@example.com"
                      value={formData.donor_email}
                      onChange={(e) => setFormData({ ...formData, donor_email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Donor Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+1-555-0199"
                      value={formData.donor_phone}
                      onChange={(e) => setFormData({ ...formData, donor_phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    >
                      <option value="">Select Category...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Book Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Structure and Interpretation of Computer Programs"
                      value={formData.book_title}
                      onChange={(e) => setFormData({ ...formData, book_title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Author *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Harold Abelson"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Physical Condition *</label>
                    <select
                      className="form-control"
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    >
                      <option value="New">New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                      <option value="Damaged">Damaged</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Remarks / Notes</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Details about edition, hardcover, donor notes, etc."
                    value={formData.requestremark}
                    onChange={(e) => setFormData({ ...formData, requestremark: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowSubmitModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveModalItem && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Approve Book Donation</h3>
              <button onClick={() => setApproveModalItem(null)} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                Approving this request will <strong>automatically create or update the Book</strong> and generate{' '}
                <strong>{approveModalItem.quantity} physical Book Copy record(s)</strong> in your inventory marked as{' '}
                <code>Available</code>.
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div><strong>Book:</strong> {approveModalItem.book_title}</div>
                <div><strong>Author:</strong> {approveModalItem.author}</div>
                <div><strong>Donor:</strong> {approveModalItem.donor_name}</div>
                <div><strong>Quantity & Condition:</strong> {approveModalItem.quantity} copy/copies ({approveModalItem.condition})</div>
              </div>

              <div className="form-group">
                <label className="form-label">Approval Remark</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={approvalRemark}
                  onChange={(e) => setApprovalRemark(e.target.value)}
                  placeholder="e.g. Condition verified. Added to Science shelf."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setApproveModalItem(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleApprove} className="btn btn-success">
                Confirm Approval & Add To Inventory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalItem && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Reject Donation Request</h3>
              <button onClick={() => setRejectModalItem(null)} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '1rem' }}>
                Are you sure you want to decline the donation for <strong>{rejectModalItem.book_title}</strong> from{' '}
                {rejectModalItem.donor_name}?
              </p>

              <div className="form-group">
                <label className="form-label">Rejection Remark *</label>
                <textarea
                  className="form-control"
                  rows="2"
                  required
                  value={rejectRemark}
                  onChange={(e) => setRejectRemark(e.target.value)}
                  placeholder="Explain why the donation was rejected..."
                />
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={removeOnReject}
                    onChange={(e) => setRemoveOnReject(e.target.checked)}
                  />
                  <span>Completely remove this record from the database (per rejection requirement)</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setRejectModalItem(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleReject} className="btn btn-danger">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

