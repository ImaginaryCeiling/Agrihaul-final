import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { RatingRequest, RatingCategory } from '../../shared/types';

interface RatingInputProps {
  onSubmit: (rating: RatingRequest) => void;
  jobId: string;
  ratedUserId: string;
  ratedUserName: string;
  ratedUserType: 'farmer' | 'carrier';
  isOpen?: boolean;
  onClose?: () => void;
}

export function RatingInput({
  onSubmit,
  jobId,
  ratedUserId,
  ratedUserName,
  ratedUserType,
  isOpen,
  onClose
}: RatingInputProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [categories, setCategories] = useState<RatingCategory[]>([
    { category: 'communication', score: 0 },
    { category: 'punctuality', score: 0 },
    { category: 'quality', score: 0 },
    { category: 'professionalism', score: 0 },
    { category: 'reliability', score: 0 }
  ]);

  const categoryLabels = {
    communication: 'Communication',
    punctuality: 'Punctuality',
    quality: 'Quality of Work',
    professionalism: 'Professionalism',
    reliability: 'Reliability'
  };

  const categoryDescriptions = {
    communication: 'How well did they communicate throughout the job?',
    punctuality: 'Were they on time for pickups and deliveries?',
    quality: ratedUserType === 'carrier' ? 'How well did they handle your cargo?' : 'How clear were their instructions and requirements?',
    professionalism: 'How professional was their conduct?',
    reliability: 'How dependable were they overall?'
  };

  const handleStarClick = (rating: number, isOverall = true, categoryIndex?: number) => {
    if (isOverall) {
      setOverallRating(rating);
    } else if (categoryIndex !== undefined) {
      const newCategories = [...categories];
      newCategories[categoryIndex].score = rating;
      setCategories(newCategories);
    }
  };

  const handleSubmit = () => {
    if (overallRating === 0) return;

    const ratingRequest: RatingRequest = {
      jobId,
      ratedUserId,
      rating: overallRating,
      comment: comment.trim() || undefined,
      categories: categories.filter(cat => cat.score > 0)
    };

    onSubmit(ratingRequest);

    // Reset form
    setOverallRating(0);
    setComment('');
    setCategories([
      { category: 'communication', score: 0 },
      { category: 'punctuality', score: 0 },
      { category: 'quality', score: 0 },
      { category: 'professionalism', score: 0 },
      { category: 'reliability', score: 0 }
    ]);

    onClose?.();
  };

  const renderStars = (
    currentRating: number,
    onStarClick: (rating: number) => void,
    onStarHover?: (rating: number) => void,
    onStarLeave?: () => void,
    isOverall = false
  ) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-colors"
            onClick={() => onStarClick(star)}
            onMouseEnter={() => onStarHover?.(star)}
            onMouseLeave={() => onStarLeave?.()}
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (isOverall ? (hoverRating || currentRating) : currentRating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const isValid = overallRating > 0;
  const averageCategoryRating = categories.filter(cat => cat.score > 0).length > 0
    ? categories.reduce((sum, cat) => sum + cat.score, 0) / categories.filter(cat => cat.score > 0).length
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rate {ratedUserName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Rating */}
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Overall Experience</h3>
              <p className="text-sm text-gray-600 mb-4">
                How would you rate your overall experience with {ratedUserName}?
              </p>
            </div>

            {renderStars(
              overallRating,
              (rating) => handleStarClick(rating, true),
              setHoverRating,
              () => setHoverRating(0),
              true
            )}

            <div className="text-sm text-gray-600">
              {overallRating > 0 && (
                <span className="font-medium">
                  {overallRating === 1 && "Poor"}
                  {overallRating === 2 && "Fair"}
                  {overallRating === 3 && "Good"}
                  {overallRating === 4 && "Very Good"}
                  {overallRating === 5 && "Excellent"}
                </span>
              )}
            </div>
          </div>

          {/* Category Ratings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Detailed Ratings</h3>
            <p className="text-sm text-gray-600">
              Rate specific aspects of your experience (optional):
            </p>

            {categories.map((category, index) => (
              <Card key={category.category} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">
                        {categoryLabels[category.category]}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {categoryDescriptions[category.category]}
                      </p>
                    </div>
                    {category.score > 0 && (
                      <Badge variant="outline">
                        {category.score}/5
                      </Badge>
                    )}
                  </div>

                  {renderStars(
                    category.score,
                    (rating) => handleStarClick(rating, false, index)
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Written Review */}
          <div className="space-y-3">
            <Label htmlFor="comment">Written Review (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Share your experience working with ${ratedUserName}...`}
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">
              {comment.length}/500 characters
            </div>
          </div>

          {/* Summary */}
          {(overallRating > 0 || averageCategoryRating > 0) && (
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Rating Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Overall Rating:</span>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{overallRating}/5</span>
                    </div>
                  </div>
                  {averageCategoryRating > 0 && (
                    <div>
                      <span className="text-gray-600">Category Average:</span>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{averageCategoryRating.toFixed(1)}/5</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!isValid}
              className="flex-1"
            >
              Submit Rating
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface QuickRatingInputProps {
  onSubmit: (rating: number) => void;
  placeholder?: string;
}

export function QuickRatingInput({ onSubmit, placeholder = "Rate this experience" }: QuickRatingInputProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
    onSubmit(starRating);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">{placeholder}:</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none"
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          >
            <Star
              className={`h-4 w-4 transition-colors ${
                star <= (hoverRating || rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <span className="text-sm font-medium">{rating}/5</span>
      )}
    </div>
  );
}