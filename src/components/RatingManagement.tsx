import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RatingDisplay, RatingSummaryDisplay } from './RatingDisplay';
import { MessageSquare, Calendar, Search, Filter, ChevronDown } from 'lucide-react';
import { Rating, RatingSummary } from '../../shared/types';

interface RatingManagementProps {
  userId: string;
  userType: 'farmer' | 'carrier';
}

export function RatingManagement({ userId, userType }: RatingManagementProps) {
  const [activeTab, setActiveTab] = useState('received');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // Mock data - in a real app, this would come from API
  const [ratingSummary] = useState<RatingSummary>({
    averageRating: 4.7,
    totalRatings: 156,
    categoryAverages: {
      communication: 4.8,
      punctuality: 4.6,
      quality: 4.9,
      professionalism: 4.7,
      reliability: 4.5
    },
    ratingDistribution: {
      5: 98,
      4: 34,
      3: 15,
      2: 6,
      1: 3
    }
  });

  const [receivedRatings] = useState<Rating[]>([
    {
      id: 'rating1',
      jobId: 'job1',
      raterId: 'farmer123',
      ratedUserId: userId,
      rating: 5,
      comment: 'Excellent service! Very professional and delivered on time. Highly recommend!',
      categories: [
        { category: 'communication', score: 5 },
        { category: 'punctuality', score: 5 },
        { category: 'quality', score: 5 },
        { category: 'professionalism', score: 5 },
        { category: 'reliability', score: 5 }
      ],
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'rating2',
      jobId: 'job2',
      raterId: 'farmer456',
      ratedUserId: userId,
      rating: 4,
      comment: 'Good carrier, delivered safely but was a bit late due to weather. Overall satisfied.',
      categories: [
        { category: 'communication', score: 4 },
        { category: 'punctuality', score: 3 },
        { category: 'quality', score: 5 },
        { category: 'professionalism', score: 4 },
        { category: 'reliability', score: 4 }
      ],
      createdAt: new Date('2024-01-10')
    },
    {
      id: 'rating3',
      jobId: 'job3',
      raterId: 'farmer789',
      ratedUserId: userId,
      rating: 5,
      comment: 'Outstanding work! Clear communication throughout and handled my crops with care.',
      categories: [
        { category: 'communication', score: 5 },
        { category: 'punctuality', score: 5 },
        { category: 'quality', score: 5 },
        { category: 'professionalism', score: 5 },
        { category: 'reliability', score: 5 }
      ],
      createdAt: new Date('2024-01-08')
    }
  ]);

  const [givenRatings] = useState<Rating[]>([
    {
      id: 'rating4',
      jobId: 'job4',
      raterId: userId,
      ratedUserId: 'farmer999',
      rating: 4,
      comment: 'Good farmer to work with. Clear instructions and fair payment.',
      categories: [
        { category: 'communication', score: 4 },
        { category: 'professionalism', score: 4 },
        { category: 'reliability', score: 4 }
      ],
      createdAt: new Date('2024-01-12')
    }
  ]);

  const filteredReceivedRatings = receivedRatings.filter(rating => {
    const matchesSearch = searchQuery === '' ||
      rating.comment?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterRating === null || rating.rating === filterRating;
    return matchesSearch && matchesFilter;
  });

  const filteredGivenRatings = givenRatings.filter(rating => {
    const matchesSearch = searchQuery === '' ||
      rating.comment?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterRating === null || rating.rating === filterRating;
    return matchesSearch && matchesFilter;
  });

  const categoryLabels = {
    communication: 'Communication',
    punctuality: 'Punctuality',
    quality: 'Quality',
    professionalism: 'Professionalism',
    reliability: 'Reliability'
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <RatingSummaryDisplay
        summary={ratingSummary}
        title={`${userType === 'farmer' ? 'Farmer' : 'Carrier'} Rating Summary`}
      />

      {/* Ratings Management */}
      <Card>
        <CardHeader>
          <CardTitle>Rating History</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="flex items-center gap-2">
              <Label htmlFor="rating-filter" className="text-sm">Filter by rating:</Label>
              <select
                id="rating-filter"
                value={filterRating || ''}
                onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All ratings</option>
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="received">
                Received ({receivedRatings.length})
              </TabsTrigger>
              <TabsTrigger value="given">
                Given ({givenRatings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="space-y-4 mt-6">
              {filteredReceivedRatings.length > 0 ? (
                <div className="space-y-4">
                  {filteredReceivedRatings.map((rating) => (
                    <Card key={rating.id} className="border-l-4 border-l-yellow-400">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <RatingDisplay
                              rating={rating.rating}
                              showCount={false}
                              size="sm"
                            />
                            <Badge variant="outline">
                              Job #{rating.jobId.slice(-4)}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {rating.createdAt.toLocaleDateString()}
                          </div>
                        </div>

                        {rating.comment && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">Review:</span>
                            </div>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                              "{rating.comment}"
                            </p>
                          </div>
                        )}

                        {rating.categories && rating.categories.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Category Ratings:</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {rating.categories.map((category) => (
                                <div key={category.category} className="flex items-center justify-between">
                                  <span className="text-xs text-gray-600">
                                    {categoryLabels[category.category]}
                                  </span>
                                  <RatingDisplay
                                    rating={category.score}
                                    showCount={false}
                                    size="sm"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <MessageSquare className="mx-auto h-12 w-12" />
                  </div>
                  <p className="text-gray-500">
                    {searchQuery || filterRating
                      ? 'No ratings match your search criteria'
                      : 'No ratings received yet'
                    }
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="given" className="space-y-4 mt-6">
              {filteredGivenRatings.length > 0 ? (
                <div className="space-y-4">
                  {filteredGivenRatings.map((rating) => (
                    <Card key={rating.id} className="border-l-4 border-l-blue-400">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <RatingDisplay
                              rating={rating.rating}
                              showCount={false}
                              size="sm"
                            />
                            <Badge variant="outline">
                              Job #{rating.jobId.slice(-4)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-gray-500">
                              {rating.createdAt.toLocaleDateString()}
                            </div>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </div>
                        </div>

                        {rating.comment && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">Your Review:</span>
                            </div>
                            <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                              "{rating.comment}"
                            </p>
                          </div>
                        )}

                        {rating.categories && rating.categories.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Your Category Ratings:</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {rating.categories.map((category) => (
                                <div key={category.category} className="flex items-center justify-between">
                                  <span className="text-xs text-gray-600">
                                    {categoryLabels[category.category]}
                                  </span>
                                  <RatingDisplay
                                    rating={category.score}
                                    showCount={false}
                                    size="sm"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <MessageSquare className="mx-auto h-12 w-12" />
                  </div>
                  <p className="text-gray-500">
                    {searchQuery || filterRating
                      ? 'No ratings match your search criteria'
                      : 'No ratings given yet'
                    }
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}