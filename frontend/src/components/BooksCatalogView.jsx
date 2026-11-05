import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { BookOpen, Plus, Search, ChevronDown, ChevronRight, Layers, Tag } from 'lucide-react';

export default function BooksCatalogView({ showToast }) {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedBookId, setExpandedBookId] = useState(null);

  // Modals
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [addCopyBookItem, setAddCopyBookItem] = useState(null);

  // Forms
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category_id: '',
    initial_copies: 1,
    condition: 'Good',
    source_type: 'Purchase'
  });

  const [copyForm, setCopyForm] = useState({
    quantity: 1,
    condition: 'Good',
    source_type: 'Purchase'
  });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.category_id = selectedCategory;

      const [booksRes, catRes] = await Promise.all([
        api.getBooks(params),
        api.getCategories()
      ]);
      setBooks(booksRes.data || []);
      setCategories(catRes.data || []);
    } catch (err) {
      showToast('Error loading books: ' + err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [search, selectedCategory]);

  const handleCreateBook = async (e) => {
    e.preventDefault();
    try {
      await api.createBook(bookForm);
      showToast('New book and initial copy added successfully!', 'success');
      setShowAddBookModal(false);
      setBookForm({
        title: '',
        author: '',
        isbn: '',
        category_id: '',
        initial_copies: 1,
        condition: 'Good',
        source_type: 'Purchase'
      });
      fetchBooks();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleAddCopies = async (e) => {
    e.preventDefault();
    if (!addCopyBookItem) return;
    try {
      await api.addCopies(addCopyBookItem.id, copyForm);
      showToast(`Added ${copyForm.quantity} physical copy/copies!`, 'success');
      setAddCopyBookItem(null);
      fetchBooks();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const toggleExpand = (bookId) => {
    setExpandedBookId(expandedBookId === bookId ? null : bookId);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Books Catalog & Physical Inventory</h1>
          <p className="page-subtitle">
            Browse library holdings, inspect individual physical copies, barcodes, source types, and availability.
          </p>
        </div>
        <div>
          <button onClick={() => setShowAddBookModal(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-body" style={{ padding: '1rem 1.5rem' }}>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ position: 'relative' }}>
                <Search
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="text"
                  placeholder="Search by title, author, or ISBN..."
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <select
                className="form-control"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Title & Author</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Total Copies</th>
                  <th>Available Now</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      Loading books catalog...
                    </td>
                  </tr>
                ) : books.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No books matching your query.
                    </td>
                  </tr>
                ) : (
                  books.map((b) => {
                    const isExpanded = expandedBookId === b.id;
                    return (
                      <React.Fragment key={b.id}>
                        <tr>
                          <td>
                            <button
                              onClick={() => toggleExpand(b.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              title="Expand physical copies"
                            >
                              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>
                          </td>
                          <td>
                            <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{b.title}</strong>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              by {b.author}
                            </div>
                          </td>
                          <td>
                            <code>{b.isbn || '—'}</code>
                          </td>
                          <td>
                            {b.category ? (
                              <span className="badge badge-ordered">{b.category.name}</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>Uncategorized</span>
                            )}
                          </td>
                          <td>
                            <strong>{b.totalCopies}</strong>
                          </td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: b.availableCopies > 0 ? 'var(--success-light)' : 'var(--danger-light)',
                                color: b.availableCopies > 0 ? 'var(--success)' : 'var(--danger)'
                              }}
                            >
                              {b.availableCopies} available
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => setAddCopyBookItem(b)}
                              className="btn btn-secondary btn-sm"
                              title="Add more copies to this title"
                            >
                              <Plus size={14} />
                              <span>Add Copies</span>
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Copies Sub-Table */}
                        {isExpanded && (
                          <tr style={{ backgroundColor: '#f8fafc' }}>
                            <td colSpan="7" style={{ padding: '1rem 1.5rem 1.5rem 3rem' }}>
                              <div style={{ marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Physical Copies for "{b.title}" ({b.copies?.length || 0}):
                              </div>
                              {b.copies && b.copies.length > 0 ? (
                                <table style={{ background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                  <thead>
                                    <tr>
                                      <th>Copy Barcode</th>
                                      <th>Condition</th>
                                      <th>Source Type</th>
                                      <th>Current Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {b.copies.map((copy) => (
                                      <tr key={copy.id}>
                                        <td>
                                          <code>{copy.copy_number}</code>
                                        </td>
                                        <td>{copy.condition}</td>
                                        <td>
                                          <span className="badge badge-ordered">{copy.source_type}</span>
                                        </td>
                                        <td>
                                          <span className={`badge badge-${copy.status.toLowerCase()}`}>
                                            {copy.status.replace(/_/g, ' ')}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                  No physical copies currently registered for this book title.
                                </p>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add New Book Modal */}
      {showAddBookModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Register New Book Title</h3>
              <button onClick={() => setShowAddBookModal(false)} className="modal-close">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateBook}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Book Title *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Compilers: Principles, Techniques, and Tools"
                    value={bookForm.title}
                    onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Author *</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Alfred V. Aho"
                      value={bookForm.author}
                      onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ISBN</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="978-0321486813"
                      value={bookForm.isbn}
                      onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={bookForm.category_id}
                      onChange={(e) => setBookForm({ ...bookForm, category_id: e.target.value })}
                    >
                      <option value="">Select Category...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial Copies to Create</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={bookForm.initial_copies}
                      onChange={(e) => setBookForm({ ...bookForm, initial_copies: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddBookModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Copies to Existing Book Modal */}
      {addCopyBookItem && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Add Physical Copies</h3>
              <button onClick={() => setAddCopyBookItem(null)} className="modal-close">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddCopies}>
              <div className="modal-body">
                <p style={{ marginBottom: '1rem' }}>
                  Adding new inventory copies for <strong>{addCopyBookItem.title}</strong> by{' '}
                  {addCopyBookItem.author}.
                </p>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Quantity to Add *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="form-control"
                      value={copyForm.quantity}
                      onChange={(e) => setCopyForm({ ...copyForm, quantity: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Condition *</label>
                    <select
                      className="form-control"
                      value={copyForm.condition}
                      onChange={(e) => setCopyForm({ ...copyForm, condition: e.target.value })}
                    >
                      <option value="New">New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Source Type</label>
                  <select
                    className="form-control"
                    value={copyForm.source_type}
                    onChange={(e) => setCopyForm({ ...copyForm, source_type: e.target.value })}
                  >
                    <option value="Purchase">Purchase</option>
                    <option value="Donation">Donation</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setAddCopyBookItem(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Generate Copies
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

