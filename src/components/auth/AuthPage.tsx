import React, { useState } from 'react';
import {
  Store,
  ShieldCheck,
  Building2,
  User as UserIcon,
  Mail,
  Lock,
  MapPin,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  checkPasswordRules,
} from '../../utils/validators.ts';
import { PasswordValidationFeedback } from '../common/PasswordValidationFeedback.tsx';

export const AuthPage: React.FC = () => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [signupGeneralError, setSignupGeneralError] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both email and password');
      return;
    }

    setLoginLoading(true);
    const res = await login(loginEmail, loginPassword);
    setLoginLoading(false);

    if (!res.success) {
      setLoginError(res.message || 'Invalid credentials');
    }
  };

  // Quick Demo Login helper
  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setLoginEmail(demoEmail);
    setLoginPassword(demoPass);
    setLoginError(null);
    setLoginLoading(true);
    const res = await login(demoEmail, demoPass);
    setLoginLoading(false);
    if (!res.success) {
      setLoginError(res.message || 'Demo login failed');
    }
  };

  // Handle Signup
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupGeneralError(null);

    const errors: Record<string, string> = {};
    const nameErr = validateName(name);
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;

    const addressErr = validateAddress(address);
    if (addressErr) errors.address = addressErr;

    const passErr = validatePassword(password);
    if (passErr) errors.password = passErr;

    setSignupErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setSignupLoading(true);
    const res = await signup(name, email, password, address);
    setSignupLoading(false);

    if (!res.success) {
      if (res.errors) {
        setSignupErrors(res.errors);
      }
      setSignupGeneralError(res.message || 'Signup failed');
    }
  };

  const nameLength = name.trim().length;
  const addressLength = address.trim().length;
  const passRules = checkPasswordRules(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-200 mb-4">
          <Store className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Store<span className="text-indigo-600">Rating</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Single unified login for Administrators, Store Owners, and Community Users
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 sm:px-10">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => {
                setMode('login');
                setLoginError(null);
              }}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer text-center ${
                mode === 'login'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In (All Roles)
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setSignupGeneralError(null);
                setSignupErrors({});
              }}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer text-center ${
                mode === 'signup'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Register as Normal User
            </button>
          </div>

          {/* Quick Demo Logins Box (Only shown on Login tab) */}
          {mode === 'login' && (
            <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-2 mb-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  One-Click Demo Test Accounts
                </span>
              </div>
              <p className="text-xs text-slate-700 mb-3">
                Click any role below to prefill & log in immediately:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin@storerating.com', 'Admin@1234')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-purple-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all text-left group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-1.5 text-purple-700 font-semibold text-xs mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </div>
                  <span className="text-[10px] text-slate-700 group-hover:text-purple-600 truncate max-w-full font-mono">
                    admin@storerating.com
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('owner@techhaven.com', 'Owner@1234')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-left group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Store Owner</span>
                  </div>
                  <span className="text-[10px] text-slate-700 group-hover:text-amber-800 truncate max-w-full font-mono">
                    owner@techhaven.com
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('user@example.com', 'User@1234')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all text-left group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-xs mb-1">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Normal User</span>
                  </div>
                  <span className="text-[10px] text-slate-700 group-hover:text-emerald-800 truncate max-w-full font-mono">
                    user@example.com
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 text-rose-700 text-sm border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. user@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 px-4 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{loginLoading ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {signupGeneralError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 text-rose-700 text-sm border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{signupGeneralError}</span>
                </div>
              )}

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
                        : nameLength > 60
                        ? 'text-rose-500 font-semibold'
                        : 'text-slate-700 font-semibold'
                    }`}
                  >
                    {nameLength}/60 chars (min 20)
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (signupErrors.name) {
                        setSignupErrors((prev) => ({ ...prev, name: '' }));
                      }
                    }}
                    placeholder="e.g. Jonathan Montgomery Vance (Min 20 characters)"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 ${
                      signupErrors.name ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                    }`}
                    required
                  />
                </div>
                {signupErrors.name ? (
                  <p className="text-xs text-rose-500 mt-1">{signupErrors.name}</p>
                ) : (
                  <p className="text-[11px] text-slate-700 mt-1">
                    Requirement: Between 20 and 60 characters long
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (signupErrors.email) {
                        setSignupErrors((prev) => ({ ...prev, email: '' }));
                      }
                    }}
                    placeholder="e.g. user@example.com"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 ${
                      signupErrors.email ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                    }`}
                    required
                  />
                </div>
                {signupErrors.email && (
                  <p className="text-xs text-rose-500 mt-1">{signupErrors.email}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Address
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      addressLength > 400 ? 'text-rose-500 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    {addressLength}/400 chars max
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute top-3 left-3.5 flex items-start pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (signupErrors.address) {
                        setSignupErrors((prev) => ({ ...prev, address: '' }));
                      }
                    }}
                    placeholder="Enter your street address, city, state, and zip code"
                    className={`w-full pl-10 pr-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 ${
                      signupErrors.address ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                    }`}
                    required
                  />
                </div>
                {signupErrors.address && (
                  <p className="text-xs text-rose-500 mt-1">{signupErrors.address}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (signupErrors.password) {
                        setSignupErrors((prev) => ({ ...prev, password: '' }));
                      }
                    }}
                    placeholder="8-16 chars, 1 uppercase, 1 special char"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 ${
                      signupErrors.password ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                    }`}
                    required
                  />
                </div>
                <PasswordValidationFeedback password={password} />
                {signupErrors.password && (
                  <p className="text-xs text-rose-500 mt-1">{signupErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  signupLoading ||
                  nameLength < 20 ||
                  nameLength > 60 ||
                  addressLength > 400 ||
                  !passRules.isValid
                }
                className="w-full py-2.5 px-4 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <span>{signupLoading ? 'Creating account...' : 'Create Normal User Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
