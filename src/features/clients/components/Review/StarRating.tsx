/**
 * StarRating Component
 * 
 * A reusable star rating component that can be used for both display and input.
 * Supports interactive mode (for forms) and read-only mode (for display).
 * 
 * Features:
 * - Interactive star selection with hover preview
 * - Read-only display with decimal ratings
 * - Customizable size and colors
 * - Accessible with keyboard navigation
 */

import React, { useState, useCallback } from 'react';

interface StarRatingProps {
  /** Current rating value (1-5) */
  value: number;
  /** Callback when rating changes (only in interactive mode) */
  onChange?: (rating: number) => void;
  /** Whether the rating can be changed */
  readonly?: boolean;
  /** Size of stars: 'sm' | 'md' | 'lg' | 'xl' */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show numeric rating next to stars */
  showValue?: boolean;
  /** Show count of ratings */
  count?: number;
  /** Additional CSS classes */
  className?: string;
}

// Size configurations for different star sizes
const sizeConfig = {
  sm: { star: 'w-4 h-4', text: 'text-sm', gap: 'gap-0.5' },
  md: { star: 'w-5 h-5', text: 'text-base', gap: 'gap-1' },
  lg: { star: 'w-6 h-6', text: 'text-lg', gap: 'gap-1' },
  xl: { star: 'w-8 h-8', text: 'text-xl', gap: 'gap-1.5' },
};

/**
 * Star Icon Component - renders a single star
 */
const StarIcon: React.FC<{
  filled: boolean;
  partial?: number; // 0-1 for partial fill
  className?: string;
}> = ({ filled, partial, className = '' }) => {
  // Full star
  if (filled && !partial) {
    return (
      <svg
        className={`${className} text-yellow-400 fill-current`}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }

  // Partial star (for decimal ratings like 4.5)
  if (partial && partial > 0) {
    return (
      <svg
        className={`${className}`}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`star-gradient-${partial}`}>
            <stop offset={`${partial * 100}%`} stopColor="#FACC15" />
            <stop offset={`${partial * 100}%`} stopColor="#E5E7EB" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#star-gradient-${partial})`}
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
    );
  }

  // Empty star
  return (
    <svg
      className={`${className} text-gray-300 fill-current`}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
};

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
  count,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const config = sizeConfig[size];
  const isInteractive = !readonly && onChange;

  // Calculate display rating (use hover if available, otherwise actual value)
  const displayRating = hoverRating ?? value;

  /**
   * Handle star click in interactive mode
   */
  const handleStarClick = useCallback((starIndex: number) => {
    if (isInteractive) {
      onChange(starIndex);
    }
  }, [isInteractive, onChange]);

  /**
   * Handle mouse enter for hover preview
   */
  const handleMouseEnter = useCallback((starIndex: number) => {
    if (isInteractive) {
      setHoverRating(starIndex);
    }
  }, [isInteractive]);

  /**
   * Handle mouse leave to reset hover state
   */
  const handleMouseLeave = useCallback(() => {
    if (isInteractive) {
      setHoverRating(null);
    }
  }, [isInteractive]);

  /**
   * Handle keyboard navigation for accessibility
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent, starIndex: number) => {
    if (!isInteractive) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(starIndex);
    }
  }, [isInteractive, onChange]);

  /**
   * Render stars based on rating
   */
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(displayRating);
      const partial = i === Math.ceil(displayRating) && displayRating % 1 > 0
        ? displayRating % 1
        : undefined;

      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
          onKeyDown={(e) => handleKeyDown(e, i)}
          disabled={readonly}
          className={`
            ${config.star}
            ${isInteractive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
            focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 rounded
            disabled:cursor-default
          `}
          aria-label={`${i} sao`}
          tabIndex={isInteractive ? 0 : -1}
        >
          <StarIcon
            filled={isFilled}
            partial={!isFilled ? partial : undefined}
            className={config.star}
          />
        </button>
      );
    }
    
    return stars;
  };

  return (
    <div className={`flex items-center ${config.gap} ${className}`}>
      {/* Stars */}
      <div
        className={`flex items-center ${config.gap}`}
        role={isInteractive ? 'radiogroup' : 'presentation'}
        aria-label="Đánh giá sao"
        onMouseLeave={handleMouseLeave}
      >
        {renderStars()}
      </div>

      {/* Numeric value display */}
      {showValue && (
        <span className={`${config.text} text-gray-700 font-medium ml-1`}>
          {value.toFixed(1)}
        </span>
      )}

      {/* Review count display */}
      {count !== undefined && (
        <span className={`${config.text} text-gray-500 ml-1`}>
          ({count.toLocaleString('vi-VN')} đánh giá)
        </span>
      )}
    </div>
  );
};

/**
 * StarRatingInput - Specialized input version with labels
 */
export const StarRatingInput: React.FC<{
  value: number;
  onChange: (rating: number) => void;
  error?: string;
  className?: string;
}> = ({ value, onChange, error, className = '' }) => {
  const labels = [
    '', // index 0 unused
    'Rất tệ',
    'Tệ',
    'Bình thường',
    'Tốt',
    'Tuyệt vời',
  ];

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-4">
        <StarRating
          value={value}
          onChange={onChange}
          size="xl"
        />
        {value > 0 && (
          <span className="text-lg font-medium text-yellow-600">
            {labels[value]}
          </span>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default StarRating;
