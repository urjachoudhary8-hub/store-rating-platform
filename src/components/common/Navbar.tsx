import React, { useState } from 'react';
import {
  Store as StoreIcon,
  ShieldCheck,
  User as UserIcon,
  Building2,
  Key,
  LogOut,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { ChangePasswordModal } from './ChangePasswordModal.tsx';

interface NavbarProps {
  onResetData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onResetData }) => {
  const { user, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            System Administrator
          </span>
        );
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Building2 className="w-3.5 h-3.5" />
            Store Owner
          </span>
        );
      case 'user':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <UserIcon className="w-3.5 h-3.5" />
            Normal User
          </span>
        );
      default:
        return null;
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm(
        'Reset demo database to fresh sample state? This restores default users, stores, and ratings.'
      )
    ) {
      return;
    }
    setResetting(true);
    try {
      const res = await fetch('/api/system/reset-demo', { method: 'POST' });
      if (res.ok) {
        onResetData?.();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <StoreIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  Store<span className="text-indigo-600">Rating</span>
                </span>
                {getRoleBadge()}
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Transparent Community Rating & Review Platform
              </p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900 truncate max-w-[200px]" title={user.name}>
                  {user.name}
                </span>
                <span className="text-[11px] text-slate-500 truncate max-w-[200px]" title={user.email}>
                  {user.email}
                </span>
              </div>

              {/* Password update button (Normal user and Store owner requirement) */}
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Update your password"
              >
                <Key className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Password</span>
              </button>

              {/* Demo reset button */}
              <button
                onClick={handleReset}
                disabled={resetting}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Reset sample data"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
                <span className="hidden lg:inline">{resetting ? 'Resetting...' : 'Reset Data'}</span>
              </button>

              {/* Log out */}
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                title="Log out from system"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
};
