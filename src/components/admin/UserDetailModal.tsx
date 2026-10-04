import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  ShieldCheck,
  Building2,
  MapPin,
  Mail,
  Calendar,
  Star,
  Store,
} from 'lucide-react';
import { UserDetailData } from '../../types/index.ts';
import { StarRating } from '../common/StarRating.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface UserDetailModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  userId,
  isOpen,
  onClose,
}) => {
  const { token } = useAuth();
  const [user, setUser] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !userId || !token) return;
    async function loadUser() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setError('Failed to load user details');
        }
      } catch (err) {
        setError('Network error loading user details');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [isOpen, userId, token]);

  if (!isOpen) return null;

  const getRoleBadge = (role?: string) => {
    switch (role) {
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
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <UserIcon className="w-3.5 h-3.5" />
            Normal User
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">User Account Profile</h3>
              <p className="text-xs text-slate-500">Comprehensive profile & role metrics</p>
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
        <div className="p-6 overflow-y-auto space-y-5">
          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading user profile...</p>
            </div>
          ) : error || !user ? (
            <div className="p-4 text-center text-rose-600 text-sm">
              {error || 'User not found'}
            </div>
          ) : (
            <>
              {/* Top Banner with Name & Role */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {user.name}
                  </h4>
                  <div className="mt-1">{getRoleBadge(user.role)}</div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg shrink-0">
                  {user.name.charAt(0)}
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-slate-700">Email</span>
                    <span className="text-slate-800 break-all">{user.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-slate-700">Physical Address</span>
                    <span className="text-slate-800">{user.address || 'No address provided'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-slate-700">Member Since</span>
                    <span className="text-slate-800">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Store Owner Specific Rating Section */}
              {user.role === 'owner' && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-600" />
                      <span>Store Owner Rating Information</span>
                    </div>

                    <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                      {user.ownerStats?.averageRating || 0} ★
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-amber-200/60">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Overall Store Rating</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xl font-bold text-slate-900">
                          {user.ownerStats?.averageRating || 0}
                        </span>
                        <StarRating rating={user.ownerStats?.averageRating || 0} size="sm" />
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 block">Total Ratings Received</span>
                      <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                        {user.ownerStats?.totalRatings || 0}
                      </span>
                    </div>
                  </div>

                  {user.ownerStats?.stores && user.ownerStats.stores.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-700 block">
                        Assigned Stores:
                      </span>
                      {user.ownerStats.stores.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Store className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-800">{s.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{s.averageRating} ★</span>
                            <span className="text-slate-400">({s.totalRatings} ratings)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
