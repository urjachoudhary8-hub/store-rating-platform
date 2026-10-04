import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { AuthPage } from './components/auth/AuthPage.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { UserDashboard } from './components/user/UserDashboard.tsx';
import { OwnerDashboard } from './components/owner/OwnerDashboard.tsx';
import { ShieldCheck, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Initializing Store Rating Platform...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Show single unified login / registration page
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col justify-between text-slate-800">
      <div>
        <Navbar onResetData={() => setRefreshKey((k) => k + 1)} />

        <main key={refreshKey}>
          {user.role === 'admin' && <AdminDashboard />}
          {user.role === 'owner' && <OwnerDashboard />}
          {user.role === 'user' && <UserDashboard />}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-200 bg-white/60 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Store Rating Platform</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-indigo-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Role-Based Access Control
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Ratings: 1 to 5 Stars</span>
            <span>•</span>
            <span>Logged in as: <strong className="text-slate-600 font-semibold">{user.email}</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
