import React, { useState } from 'react';
import { X, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { Store } from '../../types/index.ts';
import { StarRating } from '../common/StarRating.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface SubmitRatingModalProps {
  store: Store | null;
  isOpen: boolean;
  onClose: () => void;
  onRatingSubmitted: (storeId: string, rating: number, overallRating: number, totalRatings: number) => void;
}

export const SubmitRatingModal: React.FC<SubmitRatingModalProps> = ({
  store,
  isOpen,
  onClose,
  onRatingSubmitted,
}) => {
  const { token } = useAuth();
  const [selectedRating, setSelectedRating] = useState<number>(store?.userRating || 5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Sync selectedRating when store changes
  React.useEffect(() => {
    if (store) {
      setSelectedRating(store.userRating || 5);
      setError(null);
      setSuccess(false);
    }
  }, [store]);

  if (!isOpen || !store) return null;

  const isModifying = Boolean(store.userRating);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (selectedRating < 1 || selectedRating > 5) {
      setError('Please select a rating between 1 and 5 stars');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/stores/${store.id}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: selectedRating }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to submit rating');
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      onRatingSubmitted(store.id, selectedRating, data.overallRating, data.totalRatings);

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      setError('Network error occurred while submitting rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingFeedback = (val: number) => {
    switch (val) {
      case 5:
        return 'Exceptional — Outstanding service & quality!';
      case 4:
        return 'Very Good — High quality experience!';
      case 3:
        return 'Average — Acceptable, with room for improvement';
      case 2:
        return 'Below Average — Disappointing in several areas';
      case 1:
        return 'Poor — Unsatisfactory experience';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-semibold text-slate-900 text-base">
              {isModifying ? 'Modify Your Rating' : 'Submit Store Rating'}
            </h3>
            <p className="text-xs text-slate-500 truncate max-w-[280px]">{store.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900">
                {isModifying ? 'Rating Modified!' : 'Rating Submitted!'}
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                You rated {store.name} {selectedRating} star{selectedRating > 1 ? 's' : ''}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 text-rose-700 text-sm border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Select your rating (1 to 5 stars)
                </p>

                <div className="flex justify-center my-3">
                  <StarRating
                    rating={selectedRating}
                    size="lg"
                    interactive={true}
                    onRatingChange={(r) => setSelectedRating(r)}
                  />
                </div>

                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-2xl font-bold text-slate-900">{selectedRating}</span>
                  <span className="text-sm text-slate-500">/ 5</span>
                </div>

                <p className="text-xs text-indigo-600 font-medium mt-1">
                  {getRatingFeedback(selectedRating)}
                </p>
              </div>

              {isModifying && (
                <p className="text-xs text-slate-500 text-center italic">
                  Note: You are updating your previously submitted rating ({store.userRating} stars).
                </p>
              )}

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
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Star className="w-4 h-4 fill-white" />
                  <span>
                    {isSubmitting
                      ? 'Saving...'
                      : isModifying
                      ? 'Update Rating'
                      : 'Submit Rating'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
