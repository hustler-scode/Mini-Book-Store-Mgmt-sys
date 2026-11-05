import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { ShoppingCart, Plus, Building2, PackageCheck, Trash2, Calendar, DollarSign } from 'lucide-react';

export default function PurchasingView({ showToast }) {
  const [subTab, setSubTab] = useState('orders'); // 'orders' | 'suppliers'
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [receiveModalItem, setReceiveModalItem] = useState(null);
  const [receiveRemark, setReceiveRemark] = useState('');

  // New Supplier Form
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    person_fullname: '',
    phone: '',
    email: '',
    address: ''
  });

  // New Purchase Form
  const [purchaseForm, setPurchaseForm] = useState({
    supplier_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    orderremark: '',
    items: [
      {
        title: '',
        author: '',
        isbn: '',
        category_id: '',
        quantity: 1,
        unit_price: 19.99
      }
    ]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [purchasesRes, suppliersRes, categoriesRes] = await Promise.all([
        api.getPurchases(),
        api.getSuppliers(),
        api.getCategories()
      ]);
      setPurchases(purchasesRes.data || []);
      setSuppliers(suppliersRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      showToast('Error loading purchasing data: ' + err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add line item to purchase form
  const addItemRow = () => {
    setPurchaseForm({
      ...purchaseForm,
      items: [
        ...purchaseForm.items,
        { title: '', author: '', isbn: '', category_id: '', quantity: 1, unit_price: 19.99 }
      ]
    });
  };

  // Remove line item
  const removeItemRow = (index) => {
    if (purchaseForm.items.length === 1) return;
    const newItems = [...purchaseForm.items];
    newItems.splice(index, 1);
    setPurchaseForm({ ...purchaseForm, items: newItems });
  };

  // Update line item
  const updateItemRow = (index, field, value) => {
    const newItems = [...purchaseForm.items];
    newItems[index][field] = value;
    setPurchaseForm({ ...purchaseForm, items: newItems });
  };

  // Total order cost
  const calculatedTotal = purchaseForm.items.reduce((sum, item) => {
    const qty = parseInt(item.quantity, 10) || 0;
    const price = parseFloat(item.unit_price) || 0;
    return sum + qty * price;
  }, 0);

  // Submit Supplier
  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      await api.createSupplier(supplierForm);
      showToast('Supplier registered successfully!', 'success');
      setShowNewSupplierModal(false);
      setSupplierForm({ name: '', person_fullname: '', phone: '', email: '', address: '' });
      fetchData();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  // Submit Purchase Order
  const handleCreatePurchase = async (e) => {
    e.preventDefault();
    if (!purchaseForm.supplier_id) {
      showToast('Please select a supplier', 'danger');
      return;
    }
    try {
      await api.createPurchase(purchaseForm);
      showToast('Purchase order created in Ordered status!', 'success');
      setShowNewOrderModal(false);
      setPurchaseForm({
        supplier_id: '',
        purchase_date: new Date().toISOString().split('T')[0],
        orderremark: '',
        items: [{ title: '', author: '', isbn: '', category_id: '', quantity: 1, unit_price: 19.99 }]
      });
      fetchData();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  // Confirm Receipt
  const handleReceivePurchase = async () => {
    if (!receiveModalItem) return;
    try {
      const res = await api.receivePurchase(receiveModalItem.id, {
        receiveremark: receiveRemark || 'Delivered and added to inventory'
      });
      showToast(res.message || 'Purchase receipt confirmed! Inventory automatically increased.', 'success');
      setReceiveModalItem(null);
      setReceiveRemark('');
      fetchData();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Feature 2: Book Addition Through Purchasing</h1>
          <p className="page-subtitle">
            Order books from publishers and suppliers. Confirming delivery automatically creates new books and increases copy inventory.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setShowNewSupplierModal(true)} className="btn btn-secondary">
            <Building2 size={16} />
            <span>Register Supplier</span>
          </button>
          <button onClick={() => setShowNewOrderModal(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Sub tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setSubTab('orders')}
          className={`btn ${subTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <ShoppingCart size={16} />
          <span>Purchase Orders ({purchases.length})</span>
        </button>
        <button
          onClick={() => setSubTab('suppliers')}
          className={`btn ${subTab === 'suppliers' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Building2 size={16} />
          <span>Suppliers Directory ({suppliers.length})</span>
        </button>
      </div>

      {subTab === 'orders' ? (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <ShoppingCart size={20} color="#3b82f6" />
              <span>Purchase Orders</span>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Supplier</th>
                    <th>Purchase Date</th>
                    <th>Items Ordered</th>
                    <th>Total Cost</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        Loading purchase orders...
                      </td>
                    </tr>
                  ) : purchases.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No purchase orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    purchases.map((po) => (
                      <tr key={po.id}>
                        <td>
                          <strong>PO-{po.id}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {po.orderremark}
                          </div>
                        </td>
                        <td>
                          <strong>{po.supplier?.name || 'Unknown Supplier'}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Contact: {po.supplier?.person_fullname}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={13} color="var(--text-muted)" />
                            <span>{new Date(po.purchase_date).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td>
                          {po.items && po.items.map((item, idx) => (
                            <div key={idx} style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                              <strong>{item.quantity}x</strong> {item.title}{' '}
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                (@ ${parseFloat(item.unit_price).toFixed(2)})
                              </span>
                            </div>
                          ))}
                        </td>
                        <td>
                          <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
                            ${parseFloat(po.total_cost).toFixed(2)}
                          </strong>
                        </td>
                        <td>
                          <span className={`badge badge-${po.status.toLowerCase()}`}>
                            {po.status}
                          </span>
                          {po.status === 'Received' && po.receivedat && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              Rcvd: {new Date(po.receivedat).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {po.status === 'Ordered' ? (
                            <button
                              onClick={() => {
                                setReceiveModalItem(po);
                                setReceiveRemark('Delivery inspected and verified. All copies added to inventory.');
                              }}
                              className="btn btn-success btn-sm"
                              title="Confirm receipt and automatically increase inventory"
                            >
                              <PackageCheck size={14} />
                              <span>Confirm Receipt</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '600' }}>
                              ✓ Inventory Updated
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
      ) : (
        /* Suppliers List */
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Building2 size={20} color="#3b82f6" />
              <span>Registered Suppliers</span>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Supplier Name</th>
                    <th>Contact Person</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Orders Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <strong>{s.name}</strong>
                      </td>
                      <td>{s.person_fullname || '—'}</td>
                      <td>{s.phone || '—'}</td>
                      <td>{s.email || '—'}</td>
                      <td>{s.address || '—'}</td>
                      <td>
                        <span className="badge badge-ordered">
                          {s.purchases ? s.purchases.length : 0} order(s)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Supplier Modal */}
      {showNewSupplierModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Register New Supplier</h3>
              <button onClick={() => setShowNewSupplierModal(false)} className="modal-close">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSupplier}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Supplier / Bookstore Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Oxford Academic Wholesale"
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. John Miller"
                      value={supplierForm.person_fullname}
                      onChange={(e) => setSupplierForm({ ...supplierForm, person_fullname: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+1-555-0188"
                      value={supplierForm.phone}
                      onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="orders@supplier.com"
                    value={supplierForm.email}
                    onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Street, City, Postal Code"
                    value={supplierForm.address}
                    onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowNewSupplierModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Purchase Order Modal */}
      {showNewOrderModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Create Book Purchase Order</h3>
              <button onClick={() => setShowNewOrderModal(false)} className="modal-close">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreatePurchase}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Supplier *</label>
                    <select
                      required
                      className="form-control"
                      value={purchaseForm.supplier_id}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier_id: e.target.value })}
                    >
                      <option value="">Select Supplier...</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Purchase Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={purchaseForm.purchase_date}
                      onChange={(e) => setPurchaseForm({ ...purchaseForm, purchase_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Order Remark / Memo</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Fall term computer science textbooks"
                    value={purchaseForm.orderremark}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, orderremark: e.target.value })}
                  />
                </div>

                <div style={{ marginTop: '1.5rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Line Items</h4>
                  <button type="button" onClick={addItemRow} className="btn btn-secondary btn-sm">
                    <Plus size={14} /> Add Book
                  </button>
                </div>

                {purchaseForm.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem',
                      background: '#f8fafc',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <div className="form-row" style={{ marginBottom: '0.5rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <input
                          type="text"
                          required
                          placeholder="Book Title *"
                          className="form-control"
                          value={item.title}
                          onChange={(e) => updateItemRow(idx, 'title', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <input
                          type="text"
                          required
                          placeholder="Author *"
                          className="form-control"
                          value={item.author}
                          onChange={(e) => updateItemRow(idx, 'author', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <input
                          type="text"
                          placeholder="ISBN"
                          className="form-control"
                          value={item.isbn}
                          onChange={(e) => updateItemRow(idx, 'isbn', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <select
                          className="form-control"
                          value={item.category_id}
                          onChange={(e) => updateItemRow(idx, 'category_id', e.target.value)}
                        >
                          <option value="">Category...</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder="Qty"
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) => updateItemRow(idx, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          placeholder="Unit Price $"
                          className="form-control"
                          value={item.unit_price}
                          onChange={(e) => updateItemRow(idx, 'unit_price', e.target.value)}
                        />
                      </div>
                      {purchaseForm.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="btn btn-danger btn-sm"
                          style={{ alignSelf: 'center', height: '38px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div style={{ textAlign: 'right', marginTop: '1rem', fontSize: '1.1rem' }}>
                  <strong>Calculated Total: </strong>
                  <span style={{ color: 'var(--primary-dark)', fontWeight: '700' }}>
                    ${calculatedTotal.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowNewOrderModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Place Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Receipt Modal */}
      {receiveModalItem && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Confirm Delivery & Receipt</h3>
              <button onClick={() => setReceiveModalItem(null)} className="modal-close">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info">
                Confirming delivery will mark Purchase Order <strong>#PO-{receiveModalItem.id}</strong> as{' '}
                <code>Received</code> and <strong>automatically increase inventory</strong> by creating the respective physical{' '}
                <code>BookCopy</code> records (source: <code>Purchase</code>, condition: <code>New</code>, status:{' '}
                <code>Available</code>).
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div><strong>Supplier:</strong> {receiveModalItem.supplier?.name}</div>
                <div><strong>Total Cost:</strong> ${parseFloat(receiveModalItem.total_cost).toFixed(2)}</div>
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Items being added to shelves:</strong>
                  <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
                    {receiveModalItem.items?.map((it, idx) => (
                      <li key={idx}>
                        {it.quantity}x <em>{it.title}</em> by {it.author}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Receipt Remark / Inspection Notes</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={receiveRemark}
                  onChange={(e) => setReceiveRemark(e.target.value)}
                  placeholder="e.g. Delivered intact in box, cataloged and barcoded."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setReceiveModalItem(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleReceivePurchase} className="btn btn-success">
                Confirm Receipt & Add to Inventory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

