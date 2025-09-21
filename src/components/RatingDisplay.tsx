import React from 'react';
import { Star } from 'lucide-react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RatingSummary } from '../../shared/types';

interface RatingDisplayProps {
  rating: number;
  totalRatings?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export function RatingDisplay({
  rating,
  totalRatings,
  size = 'md',
  showCount = true,
  className = ''
}: RatingDisplayProps) {
  const starSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className={`${starSizes[size]} text-yellow-400 fill-current`}
        />
      );
    }

    // Half star (using CSS to show only half)
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className={`${starSizes[size]} text-gray-300`} />
          <Star
            className={`${starSizes[size]} text-yellow-400 fill-current absolute top-0 left-0`}
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          />
        </div>
      );
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`empty-${i}`}
          className={`${starSizes[size]} text-gray-300`}
        />
      );
    }

    return stars;
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {renderStars()}
      </div>
      <span className={`font-medium ${textSizes[size]}`}>
        {rating.toFixed(1)}
      </span>
      {showCount && totalRatings !== undefined && (
        <span className={`text-gray-500 ${textSizes[size]}`}>
          ({totalRatings})
        </span>
      )}
    </div>
  );
}

interface RatingSummaryDisplayProps {
  summary: RatingSummary;
  title?: string;
}

export function RatingSummaryDisplay({ summary, title = "Rating Summary" }: RatingSummaryDisplayProps) {
  const categoryLabels = {
    communication: 'Communication',
    punctuality: 'Punctuality',
    quality: 'Quality',
    professionalism: 'Professionalism',
    reliability: 'Reliability'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="text-4xl font-bold text-yellow-500 mb-2">
            {summary.averageRating.toFixed(1)}
          </div>
          <RatingDisplay
            rating={summary.averageRating}
            totalRatings={summary.totalRatings}
            size="lg"
          />
          <p className="text-sm text-gray-600 mt-1">
            Based on {summary.totalRatings} review{summary.totalRatings !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Rating Distribution</h4>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = summary.ratingDistribution[stars as keyof typeof summary.ratingDistribution];
            const percentage = summary.totalRatings > 0 ? (count / summary.totalRatings) * 100 : 0;

            return (
              <div key={stars} className="flex items-center gap-2 text-sm">
                <span className="w-6">{stars}</span>
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <div className="flex-1">
                  <Progress value={percentage} className="h-2" />
                </div>
                <span className="w-8 text-right text-xs text-gray-600">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Category Averages */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Category Breakdown</h4>
          {Object.entries(summary.categoryAverages).map(([category, score]) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-sm">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </span>
              <div className="flex items-center gap-2">
                <RatingDisplay rating={score} showCount={false} size="sm" />
                <Badge variant="outline" className="text-xs">
                  {score.toFixed(1)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickRatingProps {
  rating: number;
  totalRatings: number;
  variant?: 'compact' | 'inline' | 'badge';
}

export function QuickRating({ rating, totalRatings, variant = 'inline' }: QuickRatingProps) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1">
        <Star className="h-3 w-3 text-yellow-400 fill-current" />
        <span className="text-xs font-medium">{rating.toFixed(1)}</span>
        <span className="text-xs text-gray-500">({totalRatings})</span>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Star className="h-3 w-3 text-yellow-400 fill-current" />
        <span>{rating.toFixed(1)}</span>
      </Badge>
    );
  }

  return (
    <RatingDisplay
      rating={rating}
      totalRatings={totalRatings}
      size="sm"
    />
  );
}