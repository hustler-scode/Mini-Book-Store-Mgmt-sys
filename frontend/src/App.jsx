import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import DonationsView from './components/DonationsView';
import PurchasingView from './components/PurchasingView';
import LendingView from './components/LendingView';
import InLibraryView from './components/InLibraryView';
import BooksCatalogView from './components/BooksCatalogView';
import FinesView from './components/FinesView';
import AuthModal from './components/AuthModal';
import { api } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await api.getProfile();
        if (res.data) {
          setCurrentUser(res.data);
        }
      } catch (e) {
        localStorage.removeItem('token');
        setCurrentUser(null);
      }
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    showToast('Logged out', 'info');
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard setActiveTab={setActiveTab} showToast={showToast} />
        )}
        {activeTab === 'books' && (
          <BooksCatalogView showToast={showToast} />
        )}
        {activeTab === 'donations' && (
          <DonationsView showToast={showToast} />
        )}
        {activeTab === 'purchasing' && (
          <PurchasingView showToast={showToast} />
        )}
        {activeTab === 'lending' && (
          <LendingView showToast={showToast} />
        )}
        {activeTab === 'in-library' && (
          <InLibraryView showToast={showToast} />
        )}
        {activeTab === 'fines' && (
          <FinesView showToast={showToast} />
        )}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            loadUser();
          }}
          showToast={showToast}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className="toast"
          style={{
            borderLeft: `4px solid ${
              toast.type === 'success'
                ? 'var(--success)'
                : toast.type === 'danger'
                ? 'var(--danger)'
                : 'var(--primary)'
            }`
          }}
        >
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

