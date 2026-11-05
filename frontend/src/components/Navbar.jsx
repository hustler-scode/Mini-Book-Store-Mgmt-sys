import React from 'react';
import { BookOpen, HeartHandshake, ShoppingCart, UserCheck, BookMarked, DollarSign, LayoutDashboard, ExternalLink, LogIn, LogOut } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, currentUser, onOpenAuth, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'books', label: 'Books & Inventory', icon: BookOpen },
    { id: 'donations', label: 'Donations (F1)', icon: HeartHandshake },
    { id: 'purchasing', label: 'Purchasing (F2)', icon: ShoppingCart },
    { id: 'lending', label: 'Lending (F3)', icon: UserCheck },
    { id: 'in-library', label: 'In-Library (F4)', icon: BookMarked },
    { id: 'fines', label: 'Fines', icon: DollarSign },
  ];

  return (
    <header className="navbar">
      <div className="nav-content">
        <a href="#dashboard" onClick={() => setActiveTab('dashboard')} className="brand">
          <div className="brand-icon">
            <BookOpen size={22} />
          </div>
          <div>
            <span>Mini Bookstore & Library</span>
          </div>
        </a>

        <nav className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="nav-actions">
          <a
            href="http://localhost:5000/api-docs"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
            title="Open Swagger API documentation in new tab"
          >
            <span>Swagger API</span>
            <ExternalLink size={14} />
          </a>

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {currentUser.role?.Rolename || (currentUser.isstaff ? 'Staff' : 'Member')}
                </div>
              </div>
              <button onClick={onLogout} className="btn btn-secondary btn-sm" title="Log out">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn btn-primary btn-sm">
              <LogIn size={15} />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

