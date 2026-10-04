import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Star,
  Users,
  MapPin,
  Mail,
  ArrowUpDown,
  Search,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { OwnerDashboardData } from '../../types/index.ts';
import { StarRating } from '../common/StarRating.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

export const OwnerDashboard: React.FC = () => {
  const { token, user } = useAuth();
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Sorting for raters table
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'rating' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Search filter for raters
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/owner/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load owner dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading store dashboard...</p>
      </div>
    );
  }

  if (!data || !data.hasStore) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No Store Assigned Yet</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your store owner account is registered, but no store has been assigned to your profile yet.
            Please contact a System Administrator to link your store.
          </p>
        </div>
      </div>
    );
  }

  // Filter & sort raters
  let filteredRaters = [...data.raters];

  if (searchTerm.trim()) {
    const q = searchTerm.trim().toLowerCase();
    filteredRaters = filteredRaters.filter(
      (r) =>
        r.user.name.toLowerCase().includes(q) ||
        r.user.email.toLowerCase().includes(q) ||
        r.user.address.toLowerCase().includes(q)
    );
  }

  filteredRaters.sort((a, b) => {
    let valA: string | number = '';
    let valB: string | number = '';

    if (sortBy === 'name') {
      valA = a.user.name.toLowerCase();
      valB = b.user.name.toLowerCase();
    } else if (sortBy === 'email') {
      valA = a.user.email.toLowerCase();
      valB = b.user.email.toLowerCase();
    } else if (sortBy === 'rating') {
      valA = a.rating;
      valB = b.rating;
    } else {
      valA = new Date(a.updatedAt || a.createdAt).getTime();
      valB = new Date(b.updatedAt || b.createdAt).getTime();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field: 'name' | 'email' | 'rating' | 'date') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder(field === 'date' ? 'desc' : 'asc');
    }
  };

  const primaryStore = data.stores[0]?.store;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Store Owner Header & Store Info */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-amber-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold text-white">
              Store Owner Portal
            </span>
            <span className="text-amber-100 text-xs font-medium">
              Welcome, {user?.name.split(' ')[0]}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {primaryStore?.name || 'My Store Dashboard'}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-amber-100">
            {primaryStore?.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{primaryStore.address}</span>
              </span>
            )}
            {primaryStore?.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{primaryStore.email}</span>
              </span>
            )}
          </div>
        </div>

        <button
          onClick={fetchDashboardData}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer border border-white/20"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Ratings</span>
        </button>
      </div>

      {/* Metrics Row: Average Rating Card & Rating Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metric 1: Average Rating Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Average Store Rating
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <span className="text-5xl font-black text-slate-900 tracking-tight">
              {data.overallAverageRating > 0 ? data.overallAverageRating.toFixed(1) : '0.0'}
            </span>
            <span className="text-base font-semibold text-slate-400">/ 5.0</span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <StarRating rating={data.overallAverageRating} size="md" />
            <p className="text-xs text-slate-500">
              Based on{' '}
              <strong className="text-slate-800 font-semibold">{data.totalRatingsCount}</strong>{' '}
              verified submitted rating{data.totalRatingsCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Metric 2: Total Ratings Submitted */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Customer Submissions
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div>
            <span className="text-5xl font-black text-slate-900 tracking-tight">
              {data.totalRatingsCount}
            </span>
            <span className="text-sm font-medium text-slate-500 ml-2">Total Ratings</span>
          </div>

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Real-time feedback submitted by registered community members</span>
          </div>
        </div>

        {/* Metric 3: Rating Distribution Bars */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Star Distribution
          </span>

          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = data.ratingsBreakdown[star] || 0;
              const percentage =
                data.totalRatingsCount > 0 ? (count / data.totalRatingsCount) * 100 : 0;

              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-6 font-semibold text-slate-700 flex items-center gap-0.5 justify-end">
                    <span>{star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500 inline" />
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-medium text-slate-500 text-[11px]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table: Users who have submitted ratings */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Users Who Submitted Ratings
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive list of users with ratings, email contacts, and submission dates
            </p>
          </div>

          {/* Search raters */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user name or email..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Table Content */}
        {filteredRaters.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No ratings submitted yet</p>
            <p className="text-xs text-slate-400 mt-1">
              When normal users submit ratings for your store, they will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <th
                    onClick={() => toggleSort('name')}
                    className="py-3 px-6 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>User Name</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('email')}
                    className="py-3 px-6 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Email Address</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-6">User Address</th>
                  <th
                    onClick={() => toggleSort('rating')}
                    className="py-3 px-6 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Rating Submitted</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('date')}
                    className="py-3 px-6 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date & Time</span>
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRaters.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* User Name */}
                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[11px]">
                          {item.user.name.charAt(0)}
                        </div>
                        <span className="truncate max-w-[200px]" title={item.user.name}>
                          {item.user.name}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-6 text-slate-600">
                      <span className="truncate max-w-[200px] block" title={item.user.email}>
                        {item.user.email}
                      </span>
                    </td>

                    {/* Address */}
                    <td className="py-3.5 px-6 text-slate-500 max-w-xs truncate" title={item.user.address}>
                      {item.user.address || '—'}
                    </td>

                    {/* Rating Submitted */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md font-bold text-slate-900">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{item.rating}</span>
                        </div>
                        <StarRating rating={item.rating} size="sm" />
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-6 text-slate-500">
                      {new Date(item.updatedAt || item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
