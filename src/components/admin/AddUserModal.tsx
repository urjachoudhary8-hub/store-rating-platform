import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle2, ShieldCheck, User, Building2 } from 'lucide-react';
import { UserRole } from '../../types/index.ts';
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  checkPasswordRules,
} from '../../utils/validators.ts';
import { PasswordValidationFeedback } from '../common/PasswordValidationFeedback.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onUserAdded }) => {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<UserRole>('user');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const validationErrors: Record<string, string> = {};
    const nameErr = validateName(name);
    if (nameErr) validationErrors.name = nameErr;

    const emailErr = validateEmail(email);
    if (emailErr) validationErrors.email = emailErr;

    const addressErr = validateAddress(address);
    if (addressErr) validationErrors.address = addressErr;

    const passErr = validatePassword(password);
    if (passErr) validationErrors.password = passErr;

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          address: address.trim(),
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        }
        setGeneralError(data.message || 'Failed to create user');
        setLoading(false);
        return;
      }

      setSuccess(true);
      onUserAdded();

      setTimeout(() => {
        setSuccess(false);
        setName('');
        setEmail('');
        setPassword('');
        setAddress('');
        setRole('user');
        onClose();
      }, 1200);
    } catch (err) {
      setGeneralError('Network error while creating user');
    } finally {
      setLoading(false);
    }
  };

  const nameLength = name.trim().length;
  const addressLength = address.trim().length;
  const passRules = checkPasswordRules(password);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Add New User</h3>
              <p className="text-xs text-slate-500">Create Normal User, Administrator, or Store Owner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {success ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900">User Created!</h4>
              <p className="text-sm text-slate-500 mt-1">The new user account has been successfully registered.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {generalError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 text-rose-700 text-sm border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{generalError}</span>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  User Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      role === 'user'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Normal User</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      role === 'admin'
                        ? 'border-purple-500 bg-purple-50/50 text-purple-800 ring-2 ring-purple-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Administrator</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      role === 'owner'
                        ? 'border-amber-500 bg-amber-50/50 text-amber-800 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Store Owner</span>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Full Legal Name
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      nameLength >= 20 && nameLength <= 60
                        ? 'text-emerald-800 font-semibold'
                        : 'text-slate-700'
                    }`}
                  >
                    {nameLength}/60 (min 20)
                  </span>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Christopher Alexander Davis"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 ${
                    errors.name ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                  }`}
                  required
                />
                {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alexander.d@domain.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 ${
                    errors.email ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                  }`}
                  required
                />
                {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
              </div>

              {/* Address */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Address
                  </label>
                  <span className="text-[11px] font-mono text-slate-700">
                    {addressLength}/400 max
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, city, state, zip code"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 ${
                    errors.address ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                  }`}
                  required
                />
                {errors.address && <p className="text-xs text-rose-500 mt-1">{errors.address}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8-16 chars, 1 uppercase, 1 special char"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 ${
                    errors.password ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                  }`}
                  required
                />
                <PasswordValidationFeedback password={password} />
                {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    loading ||
                    nameLength < 20 ||
                    nameLength > 60 ||
                    addressLength > 400 ||
                    !passRules.isValid
                  }
                  className="px-5 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
