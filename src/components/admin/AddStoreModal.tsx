import React, { useState, useEffect } from 'react';
import { X, Store, AlertCircle, CheckCircle2 } from 'lucide-react';
import { User } from '../../types/index.ts';
import {
  validateStoreName,
  validateEmail,
  validateAddress,
} from '../../utils/validators.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface AddStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreAdded: () => void;
}

export const AddStoreModal: React.FC<AddStoreModalProps> = ({
  isOpen,
  onClose,
  onStoreAdded,
}) => {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ownerId, setOwnerId] = useState('');

  const [owners, setOwners] = useState<User[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch available owners
  useEffect(() => {
    if (!isOpen || !token) return;
    async function loadOwners() {
      try {
        const res = await fetch('/api/admin/users?role=owner', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOwners(data.users || []);
        }
      } catch (err) {
        console.error('Failed to load store owners:', err);
      }
    }
    loadOwners();
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const validationErrors: Record<string, string> = {};
    const nameErr = validateStoreName(name);
    if (nameErr) validationErrors.name = nameErr;

    const emailErr = validateEmail(email);
    if (emailErr) validationErrors.email = emailErr;

    const addressErr = validateAddress(address);
    if (addressErr) validationErrors.address = addressErr;

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          address: address.trim(),
          ownerId: ownerId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        }
        setGeneralError(data.message || 'Failed to create store');
        setLoading(false);
        return;
      }

      setSuccess(true);
      onStoreAdded();

      setTimeout(() => {
        setSuccess(false);
        setName('');
        setEmail('');
        setAddress('');
        setOwnerId('');
        onClose();
      }, 1200);
    } catch (err) {
      setGeneralError('Network error while creating store');
    } finally {
      setLoading(false);
    }
  };

  const addressLength = address.trim().length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Add New Store</h3>
              <p className="text-xs text-slate-500">Register a new store into the community platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900">Store Registered!</h4>
              <p className="text-sm text-slate-500 mt-1">The store is now live for community members to rate.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {generalError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 text-rose-700 text-sm border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{generalError}</span>
                </div>
              )}

              {/* Store Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Horizon Fitness Center"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 ${
                    errors.name ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                  }`}
                  required
                />
                {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
              </div>

              {/* Store Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Store Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. contact@storebusiness.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 ${
                    errors.email ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                  }`}
                  required
                />
                {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
              </div>

              {/* Store Address */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Store Physical Address
                  </label>
                  <span className="text-[11px] font-mono text-slate-700">
                    {addressLength}/400 max
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, unit, city, state, zip code"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 ${
                    errors.address ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                  }`}
                  required
                />
                {errors.address && <p className="text-xs text-rose-500 mt-1">{errors.address}</p>}
              </div>

              {/* Store Owner Assignment (optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign Store Owner (Optional)
                </label>
                <select
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 bg-white"
                >
                  <option value="">-- No Owner Assigned (Unassigned) --</option>
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.email})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-700 mt-1">
                  Store owners can log in and view users who submitted ratings for this store.
                </p>
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
                  disabled={loading || addressLength > 400}
                  className="px-5 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  {loading ? 'Creating...' : 'Register Store'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
