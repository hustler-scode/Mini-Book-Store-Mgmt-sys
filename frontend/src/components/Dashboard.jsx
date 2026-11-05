import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  BookOpen,
  CheckCircle2,
  HeartHandshake,
  ShoppingCart,
  UserCheck,
  BookMarked,
  DollarSign,
  AlertTriangle,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function Dashboard({ setActiveTab, showToast }) {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableCopies: 0,
    totalCopies: 0,
    activeLoans: 0,
    overdueLoans: 0,
    inLibraryActive: 0,
    inLibraryOverdue: 0,
    pendingDonations: 0,
    unpaidFinesCount: 0,
    unpaidFinesTotal: 0
  });
  const [loading, setLoading] = useState(true);
  const [overdueLoansList, setOverdueLoansList] = useState([]);
  const [overdueInLibList, setOverdueInLibList] = useState([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [
        booksRes,
        copiesRes,
        lendsRes,
        overdueLendsRes,
        inLibRes,
        overdueInLibRes,
        donationsRes,
        finesRes
      ] = await Promise.all([
        api.getBooks().catch(() => ({ data: [] })),
        api.getCopies().catch(() => ({ data: [] })),
        api.getLends({ status: 'Lend' }).catch(() => ({ data: [] })),
        api.getOverdueLends().catch(() => ({ data: [] })),
        api.getInLibrarySessions({ status: 'Received' }).catch(() => ({ data: [] })),
        api.getOverdueInLibrarySessions().catch(() => ({ data: [] })),
        api.getDonations({ status: 'requested' }).catch(() => ({ data: [] })),
        api.getFines({ status: 'Unpaid' }).catch(() => ({ data: [] }))
      ]);

      const books = booksRes.data || [];
      const copies = copiesRes.data || [];
      const availableCopies = copies.filter((c) => c.status === 'Available').length;
      const activeLoans = lendsRes.data || [];
      const overdueLoans = overdueLendsRes.data || [];
      const inLibActive = inLibRes.data || [];
      const overdueInLib = overdueInLibRes.data || [];
      const pendingDonations = donationsRes.data || [];
      const unpaidFines = finesRes.data || [];

      const unpaidTotal = unpaidFines.reduce(
        (sum, f) => sum + parseFloat(f.amount || 0),
        0
      );

      setStats({
        totalBooks: books.length,
        totalCopies: copies.length,
        availableCopies,
        activeLoans: activeLoans.length,
        overdueLoans: overdueLoans.length,
        inLibraryActive: inLibActive.length,
        inLibraryOverdue: overdueInLib.length,
        pendingDonations: pendingDonations.length,
        unpaidFinesCount: unpaidFines.length,
        unpaidFinesTotal: unpaidTotal.toFixed(2)
      });

      setOverdueLoansList(overdueLoans);
      setOverdueInLibList(overdueInLib);
    } catch (err) {
      showToast('Error loading dashboard: ' + err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Library Dashboard</h1>
          <p className="page-subtitle">
            Real-time management overview of inventory, donations, purchases, loans, and in-library readers.
          </p>
        </div>
        <div>
          <button onClick={loadDashboardData} className="btn btn-secondary btn-sm">
            Refresh Metrics
          </button>
        </div>
      </div>

      {/* Critical Overdue Alerts */}
      {stats.overdueLoans > 0 && (
        <div className="alert alert-danger">
          <AlertTriangle size={20} />
          <div style={{ flex: 1 }}>
            <strong>Action Required:</strong> {stats.overdueLoans} book loan(s) are currently overdue for take-home return.
          </div>
          <button onClick={() => setActiveTab('lending')} className="btn btn-danger btn-sm">
            View Overdue Loans
          </button>
        </div>
      )}

      {stats.inLibraryOverdue > 0 && (
        <div className="alert alert-warning">
          <Clock size={20} />
          <div style={{ flex: 1 }}>
            <strong>Desk Alert:</strong> {stats.inLibraryOverdue} reader(s) are past their expected desk return time.
          </div>
          <button onClick={() => setActiveTab('in-library')} className="btn btn-primary btn-sm">
            View Desk Sessions
          </button>
        </div>
      )}

      {/* Key Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.totalBooks}</div>
            <div className="stat-label">Unique Book Titles</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-value">
              {stats.availableCopies} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ {stats.totalCopies}</span>
            </div>
            <div className="stat-label">Available Physical Copies</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.activeLoans}</div>
            <div className="stat-label">Active Take-Home Loans</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <BookMarked size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.inLibraryActive}</div>
            <div className="stat-label">In-Library Readers Now</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fffbeb', color: '#f59e0b' }}>
            <HeartHandshake size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.pendingDonations}</div>
            <div className="stat-label">Pending Donation Requests</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-value">${stats.unpaidFinesTotal}</div>
            <div className="stat-label">{stats.unpaidFinesCount} Unpaid Fines</div>
          </div>
        </div>
      </div>

      {/* Quick Access to the 4 Core System Features */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Core Operations & Features</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            
            <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '10px', background: '#fafafa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                <HeartHandshake size={20} color="#f59e0b" />
                <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>1. Book Receiving (Donations)</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Accept community book contributions. Approving a request automatically creates the book and adds physical copies to inventory.
              </p>
              <button onClick={() => setActiveTab('donations')} className="btn btn-secondary btn-sm">
                <span>Manage Donations</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '10px', background: '#fafafa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                <ShoppingCart size={20} color="#3b82f6" />
                <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>2. Book Purchasing</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Register suppliers and place purchase orders. Confirming delivery automatically creates book copies and increases shelf inventory.
              </p>
              <button onClick={() => setActiveTab('purchasing')} className="btn btn-secondary btn-sm">
                <span>Manage Purchases</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '10px', background: '#fafafa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                <UserCheck size={20} color="#8b5cf6" />
                <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>3. Book Lending</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Borrow physical copies for take-home reading. Strict availability protection blocks lending the same copy twice. Returns compute overdue fines.
              </p>
              <button onClick={() => setActiveTab('lending')} className="btn btn-secondary btn-sm">
                <span>Manage Lending</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '10px', background: '#fafafa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                <BookMarked size={20} color="#0284c7" />
                <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>4. In-Library Book Use</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Check out books to visitors inside the library. Marks copies as In-Library Use and monitors overdue desk returns.
              </p>
              <button onClick={() => setActiveTab('in-library')} className="btn btn-secondary btn-sm">
                <span>In-Library Desk</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

