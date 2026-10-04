import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showText?: boolean;
  totalRatings?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showText = false,
  totalRatings,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const currentVal = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="inline-flex items-center gap-1.5 select-none">
      <div className="flex items-center">
        {Array.from({ length: maxStars }).map((_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= Math.round(currentVal);
          const isHalf = !isFilled && starValue - 0.5 <= currentVal;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange?.(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`p-0.5 transition-transform ${
                interactive
                  ? 'cursor-pointer hover:scale-115 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded'
                  : 'cursor-default'
              }`}
              title={interactive ? `Rate ${starValue} star${starValue > 1 ? 's' : ''}` : undefined}
            >
              <Star
                className={`${starSizes[size]} transition-colors duration-150 ${
                  isFilled
                    ? 'fill-amber-400 text-amber-500'
                    : isHalf
                    ? 'fill-amber-200 text-amber-400'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showText && (
        <span className="text-xs font-semibold text-slate-700 ml-1">
          {rating > 0 ? rating.toFixed(1) : 'No ratings'}
          {totalRatings !== undefined && (
            <span className="text-slate-600 font-normal ml-1">
              ({totalRatings} {totalRatings === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </span>
      )}
    </div>
  );
};
