import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Store as StoreIcon,
  Star,
  Plus,
  Search,
  ArrowUpDown,
  Eye,
  RefreshCw,
  ShieldCheck,
  Building2,
  User as UserIcon,
  RotateCcw,
} from 'lucide-react';
import {
  AdminDashboardStats,
  User,
  Store,
  UserRole,
} from '../../types/index.ts';
import { StarRating } from '../common/StarRating.tsx';
import { AddUserModal } from './AddUserModal.tsx';
import { AddStoreModal } from './AddStoreModal.tsx';
import { UserDetailModal } from './UserDetailModal.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

export const AdminDashboard: React.FC = () => {
  const { token } = useAuth();

  // Active view tab: 'users' | 'stores'
  const [activeTab, setActiveTab] = useState<'users' | 'stores'>('users');

  // Stats
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users data & table controls
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userFilterName, setUserFilterName] = useState('');
  const [userFilterEmail, setUserFilterEmail] = useState('');
  const [userFilterAddress, setUserFilterAddress] = useState('');
  const [userFilterRole, setUserFilterRole] = useState<string>('');
  const [userSortBy, setUserSortBy] = useState<string>('createdAt');
  const [userSortOrder, setUserSortOrder] = useState<'asc' | 'desc'>('desc');

  // Stores data & table controls
  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [storeFilterName, setStoreFilterName] = useState('');
  const [storeFilterEmail, setStoreFilterEmail] = useState('');
  const [storeFilterAddress, setStoreFilterAddress] = useState('');
  const [storeSortBy, setStoreSortBy] = useState<string>('createdAt');
  const [storeSortOrder, setStoreSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);

  // Fetch Dashboard Stats
  const fetchStats = useCallback(async () => {
    if (!token) return;
    setStatsLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setStats(json);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setUsersLoading(true);
    try {
      const params = new URLSearchParams();
      if (userFilterName.trim()) params.append('name', userFilterName.trim());
      if (userFilterEmail.trim()) params.append('email', userFilterEmail.trim());
      if (userFilterAddress.trim()) params.append('address', userFilterAddress.trim());
      if (userFilterRole) params.append('role', userFilterRole);
      params.append('sortBy', userSortBy);
      params.append('sortOrder', userSortOrder);

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, [token, userFilterName, userFilterEmail, userFilterAddress, userFilterRole, userSortBy, userSortOrder]);

  // Fetch Stores
  const fetchStores = useCallback(async () => {
    if (!token) return;
    setStoresLoading(true);
    try {
      const params = new URLSearchParams();
      if (storeFilterName.trim()) params.append('name', storeFilterName.trim());
      if (storeFilterEmail.trim()) params.append('email', storeFilterEmail.trim());
      if (storeFilterAddress.trim()) params.append('address', storeFilterAddress.trim());
      params.append('sortBy', storeSortBy);
      params.append('sortOrder', storeSortOrder);

      const res = await fetch(`/api/admin/stores?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setStores(json.stores || []);
      }
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setStoresLoading(false);
    }
  }, [token, storeFilterName, storeFilterEmail, storeFilterAddress, storeSortBy, storeSortOrder]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchStores();
    }
  }, [activeTab, fetchUsers, fetchStores]);

  const toggleUserSort = (field: string) => {
    if (userSortBy === field) {
      setUserSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setUserSortBy(field);
      setUserSortOrder('asc');
    }
  };

  const toggleStoreSort = (field: string) => {
    if (storeSortBy === field) {
      setStoreSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setStoreSortBy(field);
      setStoreSortOrder('asc');
    }
  };

  const handleOpenUserDetail = (id: string) => {
    setSelectedUserId(id);
    setIsUserDetailOpen(true);
  };

  const refreshAll = () => {
    fetchStats();
    if (activeTab === 'users') fetchUsers();
    else fetchStores();
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700 border border-purple-200">
            <ShieldCheck className="w-3 h-3" />
            Admin
          </span>
        );
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Building2 className="w-3 h-3" />
            Store Owner
          </span>
        );
      case 'user':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <UserIcon className="w-3 h-3" />
            Normal User
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            System Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Platform governance: monitor stores, user accounts, and community ratings
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddStoreOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Store</span>
          </button>

          <button
            onClick={() => setIsAddUserOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>

          <button
            onClick={refreshAll}
            title="Refresh dashboard"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Required Admin Metric Cards:
          ○ Total number of users
          ○ Total number of stores
          ○ Total number of submitted ratings
      */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Users */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Total Users
            </span>
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {statsLoading ? '...' : stats?.totalUsers || 0}
            </span>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
              <span className="text-purple-600 font-semibold">{stats?.breakdown.adminCount} Admins</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold">{stats?.breakdown.normalUserCount} Normal</span>
              <span>•</span>
              <span className="text-amber-600 font-semibold">{stats?.breakdown.storeOwnerCount} Owners</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Stores */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Total Registered Stores
            </span>
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {statsLoading ? '...' : stats?.totalStores || 0}
            </span>
            <p className="text-[11px] text-slate-500 mt-2">Active retail & service locations</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <StoreIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Total Submitted Ratings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Total Submitted Ratings
            </span>
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {statsLoading ? '...' : stats?.totalRatings || 0}
            </span>
            <p className="text-[11px] text-slate-500 mt-2">Verified community evaluations</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
        </div>
      </div>

      {/* Main Tab Navigation & Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-4 gap-6 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users Directory ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stores')}
            className={`pb-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'stores'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <StoreIcon className="w-4 h-4" />
            <span>Stores Directory ({stores.length})</span>
          </button>
        </div>

        {/* USERS TAB CONTENT */}
        {activeTab === 'users' && (
          <div className="p-6 space-y-4">
            {/* User Filters: Name, Email, Address, Role */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Filter Users Directory
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Name filter */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Filter by Name
                  </label>
                  <input
                    type="text"
                    value={userFilterName}
                    onChange={(e) => setUserFilterName(e.target.value)}
                    placeholder="Search name..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-purple-500 text-slate-800 bg-white"
                  />
                </div>

                {/* Email filter */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Filter by Email
                  </label>
                  <input
                    type="text"
                    value={userFilterEmail}
                    onChange={(e) => setUserFilterEmail(e.target.value)}
                    placeholder="Search email..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-purple-500 text-slate-800 bg-white"
                  />
                </div>

                {/* Address filter */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Filter by Address
                  </label>
                  <input
                    type="text"
                    value={userFilterAddress}
                    onChange={(e) => setUserFilterAddress(e.target.value)}
                    placeholder="Search address..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-purple-500 text-slate-800 bg-white"
                  />
                </div>

                {/* Role filter */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Filter by Role
                  </label>
                  <select
                    value={userFilterRole}
                    onChange={(e) => setUserFilterRole(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-purple-500 text-slate-800 bg-white"
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Administrator</option>
                    <option value="owner">Store Owner</option>
                    <option value="user">Normal User</option>
                  </select>
                </div>
              </div>

              {(userFilterName || userFilterEmail || userFilterAddress || userFilterRole) && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setUserFilterName('');
                      setUserFilterEmail('');
                      setUserFilterAddress('');
                      setUserFilterRole('');
                    }}
                    className="text-xs text-purple-600 font-semibold hover:underline cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Users Table */}
            {usersLoading ? (
              <div className="py-12 text-center text-slate-500">
                <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs">Loading users directory...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <p className="text-sm font-semibold">No users matched your filter criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                      <th
                        onClick={() => toggleUserSort('name')}
                        className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Name</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleUserSort('email')}
                        className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Email</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleUserSort('address')}
                        className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Address</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleUserSort('role')}
                        className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Role</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </th>
                      {/* Store Owner Rating column: Displayed if store owner! */}
                      <th
                        onClick={() => toggleUserSort('rating')}
                        className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Owner Rating</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Name */}
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                              {u.name.charAt(0)}
                            </div>
                            <span className="truncate max-w-[180px]" title={u.name}>
                              {u.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="truncate max-w-[180px] block" title={u.email}>
                            {u.email}
                          </span>
                        </td>

                        {/* Address */}
                        <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate" title={u.address}>
                          {u.address}
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">{getRoleBadge(u.role)}</td>

                        {/* Owner Rating: If user is Store Owner, their Rating is displayed! */}
                        <td className="py-3.5 px-4">
                          {u.role === 'owner' ? (
                            u.ownerRating && u.ownerRating.storesCount > 0 ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">
                                  {u.ownerRating.averageRating} ★
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  ({u.ownerRating.totalRatings})
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No store linked</span>
                            )
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenUserDetail(u.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="View comprehensive details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* STORES TAB CONTENT */}
        {activeTab === 'stores' && (
          <div className="p-6 space-y-4">
            {/* Store Filters: Name, Email, Address */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Filter Stores Directory
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={storeFilterName}
                    onChange={(e) => setStoreFilterName(e.target.value)}
                    placeholder="Search store name..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 text-slate-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Store Email
                  </label>
                  <input
                    type="text"
                    value={storeFilterEmail}
                    onChange={(e) => setStoreFilterEmail(e.target.value)}
                    placeholder="Search email..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 text-slate-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Store Address
                  </label>
                  <input
                    type="text"
                    value={storeFilterAddress}
                    onChange={(e) => setStoreFilterAddress(e.target.value)}
                    placeholder="Search address..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 text-slate-800 bg-white"
                  />
                </div>
              </div>

              {(storeFilterName || storeFilterEmail || storeFilterAddress) && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setStoreFilterName('');
                      setStoreFilterEmail('');
                      setStoreFilterAddress('');
                    }}
                    className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
                  >
                    Reset All Store Filters
                  </button>
                </div>
              )}
            </div>

            {/* Stores Table: Name, Email, Address, Rating */}
            {storesLoading ? (
              <div className="py-12 text-center text-slate-500">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs">Loading stores directory...</p>
              </div>
            ) : stores.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <p className="text-sm font-semibold">No stores matched your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                      <th
                        onClick={() => toggleStoreSort('name')}
                        className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Store Name</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleStoreSort('email')}
                        className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Email</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleStoreSort('address')}
                        className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Address</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </th>
                      <th
                        onClick={() => toggleStoreSort('rating')}
                        className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Overall Rating</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-4">Assigned Store Owner</th>
                      <th className="py-3 px-4">Total Reviews</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stores.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Name */}
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <StoreIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span className="truncate max-w-[200px]" title={s.name}>
                              {s.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="truncate max-w-[180px] block" title={s.email}>
                            {s.email}
                          </span>
                        </td>

                        {/* Address */}
                        <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate" title={s.address}>
                          {s.address}
                        </td>

                        {/* Rating */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {(s as any).rating !== undefined ? (s as any).rating : s.overallRating} ★
                            </span>
                            <StarRating
                              rating={(s as any).rating !== undefined ? (s as any).rating : s.overallRating}
                              size="sm"
                            />
                          </div>
                        </td>

                        {/* Owner */}
                        <td className="py-3.5 px-4 text-slate-600">
                          {s.owner ? (
                            <span className="font-medium text-slate-800">{s.owner.name}</span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        {/* Total Reviews */}
                        <td className="py-3.5 px-4 text-slate-500">
                          {s.totalRatings} submissions
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onUserAdded={() => {
          fetchUsers();
          fetchStats();
        }}
      />

      <AddStoreModal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        onStoreAdded={() => {
          fetchStores();
          fetchStats();
        }}
      />

      <UserDetailModal
        userId={selectedUserId}
        isOpen={isUserDetailOpen}
        onClose={() => {
          setIsUserDetailOpen(false);
          setSelectedUserId(null);
        }}
      />
    </div>
  );
};
