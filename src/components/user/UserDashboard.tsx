import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Store as StoreIcon,
  MapPin,
  Mail,
  Star,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { Store } from '../../types/index.ts';
import { StarRating } from '../common/StarRating.tsx';
import { SubmitRatingModal } from './SubmitRatingModal.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

export const UserDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAddress, setFilterAddress] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState<'name' | 'address' | 'rating' | 'userRating'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Rating Modal state
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (filterAddress.trim()) params.append('address', filterAddress.trim());
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/stores?${params.toString()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setStores(data.stores);
      }
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterAddress, sortBy, sortOrder, token]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleOpenRatingModal = (store: Store) => {
    setSelectedStore(store);
    setIsRatingModalOpen(true);
  };

  const handleRatingSubmitted = (
    storeId: string,
    rating: number,
    overallRating: number,
    totalRatings: number
  ) => {
    setStores((prev) =>
      prev.map((s) =>
        s.id === storeId
          ? {
              ...s,
              userRating: rating,
              userRatingSubmittedAt: new Date().toISOString(),
              overallRating,
              totalRatings,
            }
          : s
      )
    );
  };

  const toggleSort = (field: 'name' | 'address' | 'rating' | 'userRating') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Stats calculation
  const totalStores = stores.length;
  const ratedByMeCount = stores.filter((s) => s.userRating !== null && s.userRating !== undefined).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Welcome & Stats Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-medium mb-3">
            Community Explorer Dashboard
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name.split(' ')[0]}!
          </h2>
          <p className="text-indigo-100 text-sm mt-1 max-w-xl">
            Explore registered neighborhood stores, view authentic ratings from real community members,
            and share your feedback by submitting ratings from 1 to 5 stars.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
          <div className="text-center px-3 border-r border-white/20">
            <span className="block text-2xl font-bold">{totalStores}</span>
            <span className="text-[11px] text-indigo-100 uppercase tracking-wider">Stores</span>
          </div>
          <div className="text-center px-3">
            <span className="block text-2xl font-bold text-amber-300">{ratedByMeCount}</span>
            <span className="text-[11px] text-indigo-100 uppercase tracking-wider">Rated by You</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Main search: Name or Address */}
          <div className="md:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search stores by Name or Address..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Specific address filter */}
          <div className="md:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={filterAddress}
              onChange={(e) => setFilterAddress(e.target.value)}
              placeholder="Filter by city, state, or address..."
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Refresh button */}
          <div className="md:col-span-2 flex items-center justify-end gap-2">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterAddress('');
              }}
              title="Clear filters"
              className="px-3 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
            >
              Clear
            </button>
            <button
              onClick={fetchStores}
              title="Refresh list"
              className="p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer border border-slate-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Sorting Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort by:
          </span>

          <button
            onClick={() => toggleSort('name')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer flex items-center gap-1 ${
              sortBy === 'name'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
          >
            <span>Store Name</span>
            {sortBy === 'name' && (
              <span className="text-[10px] font-bold">{sortOrder === 'asc' ? '↑ A-Z' : '↓ Z-A'}</span>
            )}
          </button>

          <button
            onClick={() => toggleSort('rating')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer flex items-center gap-1 ${
              sortBy === 'rating'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
          >
            <span>Overall Rating</span>
            {sortBy === 'rating' && (
              <span className="text-[10px] font-bold">{sortOrder === 'asc' ? '↑ Low' : '↓ High'}</span>
            )}
          </button>

          <button
            onClick={() => toggleSort('userRating')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer flex items-center gap-1 ${
              sortBy === 'userRating'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
          >
            <span>Your Rating</span>
            {sortBy === 'userRating' && (
              <span className="text-[10px] font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>

          <button
            onClick={() => toggleSort('address')}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer flex items-center gap-1 ${
              sortBy === 'address'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
          >
            <span>Address</span>
            {sortBy === 'address' && (
              <span className="text-[10px] font-bold">{sortOrder === 'asc' ? '↑ A-Z' : '↓ Z-A'}</span>
            )}
          </button>
        </div>
      </div>

      {/* Store Listings */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Loading store directory...</p>
        </div>
      ) : stores.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <StoreIcon className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No stores found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            No stores matched your current search filters. Try clearing your search term or address filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterAddress('');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map((store) => {
            const hasUserRated = store.userRating !== null && store.userRating !== undefined;

            return (
              <div
                key={store.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-4">
                  {/* Top Bar with Icon & Rating Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <StoreIcon className="w-6 h-6" />
                    </div>

                    {/* Overall Rating Pill */}
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <span className="text-xs font-bold text-slate-900">
                        {store.overallRating > 0 ? store.overallRating.toFixed(1) : 'New'}
                      </span>
                      <span className="text-[11px] text-slate-700">
                        ({store.totalRatings})
                      </span>
                    </div>
                  </div>

                  {/* Store Name & Details */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors">
                      {store.name}
                    </h3>
                    <div className="flex items-start gap-1.5 mt-2 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                      <span className="line-clamp-2">{store.address}</span>
                    </div>
                    {store.email && (
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600">
                        <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{store.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Rating Stars Visual */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-600 font-medium mb-1">
                        Community Rating
                      </p>
                      <StarRating
                        rating={store.overallRating}
                        size="sm"
                        showText={true}
                        totalRatings={store.totalRatings}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer: User's Rating Status & Action Button */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                  {hasUserRated ? (
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Your Rating: {store.userRating} ★</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600 italic">Not rated yet</span>
                  )}

                  <button
                    onClick={() => handleOpenRatingModal(store)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      hasUserRated
                        ? 'bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {hasUserRated ? (
                      <>
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Modify Rating</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-3.5 h-3.5 fill-white" />
                        <span>Submit Rating</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for submitting / modifying ratings */}
      <SubmitRatingModal
        store={selectedStore}
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </div>
  );
};
