import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  MapPin, 
  Plus, 
  Search, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  DollarSign,
  Star,
  Truck,
  Package
} from 'lucide-react';

interface DashboardProps {
  userType: 'farmer' | 'carrier' | null;
  onNavigateToJobPosting: () => void;
  onNavigateToJobBrowser: () => void;
}

export function Dashboard({ userType, onNavigateToJobPosting, onNavigateToJobBrowser }: DashboardProps) {
  const [selectedMapView, setSelectedMapView] = useState<'jobs' | 'trucks'>('jobs');

  // Mock data
  const farmerStats = {
    activeJobs: 3,
    completedJobs: 15,
    totalSpent: 8750,
    avgRating: 4.8,
    trustScore: 92
  };

  const carrierStats = {
    availableJobs: 12,
    activeDeliveries: 2,
    completedJobs: 28,
    totalEarned: 15420,
    avgRating: 4.9,
    trustScore: 95
  };

  const mockJobs = [
    {
      id: 1,
      farmer: "Green Valley Farm",
      crop: "Corn",
      quantity: "500 bushels",
      pickup: "Rural Rd 123, Farm County",
      delivery: "Grain Elevator, Market City",
      distance: "45 miles",
      payment: 850,
      urgency: "high",
      status: "posted"
    },
    {
      id: 2,
      farmer: "Sunset Acres",
      crop: "Soybeans",
      quantity: "300 bushels",
      pickup: "Highway 67, South County",
      delivery: "Processing Plant, Industrial Ave",
      distance: "32 miles",
      payment: 620,
      urgency: "medium",
      status: "in-progress"
    }
  ];

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl text-foreground">
            Welcome back, {userType === 'farmer' ? 'Farmer' : 'Carrier'}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {userType === 'farmer' 
              ? 'Manage your deliveries and connect with reliable carriers.'
              : 'Find new jobs and manage your deliveries.'
            }
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          {userType === 'farmer' && (
            <Button 
              onClick={onNavigateToJobPosting} 
              className="bg-green-500 hover:bg-green-600 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3"
              size="sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Post New Job</span>
              <span className="sm:hidden">Post Job</span>
            </Button>
          )}
          {userType === 'carrier' && (
            <Button 
              onClick={onNavigateToJobBrowser} 
              className="bg-green-500 hover:bg-green-600 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3"
              size="sm"
            >
              <Search className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Find Jobs</span>
              <span className="sm:hidden">Jobs</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {userType === 'farmer' ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm text-muted-foreground">Active Jobs</CardTitle>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl">{farmerStats.activeJobs}</div>
                <p className="text-xs text-muted-foreground">Currently shipping</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm text-muted-foreground">Completed</CardTitle>
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl">{farmerStats.completedJobs}</div>
                <p className="text-xs text-muted-foreground">Total deliveries</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm text-muted-foreground">Total Spent</CardTitle>
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl">${farmerStats.totalSpent.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">On logistics</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm text-muted-foreground">Trust Score</CardTitle>
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl">{farmerStats.trustScore}%</div>
                <Progress value={farmerStats.trustScore} className="mt-2" />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm text-muted-foreground">Available Jobs</CardTitle>
                <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl">{carrierStats.availableJobs}</div>
                <p className="text-xs text-muted-foreground">In your area</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm text-muted-foreground">Active Deliveries</CardTitle>
                <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl">{carrierStats.activeDeliveries}</div>
                <p className="text-xs text-muted-foreground">Currently shipping</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm text-muted-foreground">Total Earned</CardTitle>
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl">${carrierStats.totalEarned.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">This year</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm text-muted-foreground">Trust Score</CardTitle>
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl">{carrierStats.trustScore}%</div>
                <Progress value={carrierStats.trustScore} className="mt-2" />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Map View */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                Live Map
              </CardTitle>
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant={selectedMapView === 'jobs' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMapView('jobs')}
                  className="text-xs px-2 py-1"
                >
                  Jobs
                </Button>
                <Button
                  variant={selectedMapView === 'trucks' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMapView('trucks')}
                  className="text-xs px-2 py-1"
                >
                  Trucks
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px] bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm sm:text-base text-muted-foreground">
                  Interactive map showing {selectedMapView === 'jobs' ? 'available jobs' : 'active trucks'}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Map integration would be implemented here
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              {userType === 'farmer' ? 'Recent Jobs' : 'Available Jobs'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {mockJobs.slice(0, 3).map(job => (
                <div key={job.id} className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xs sm:text-sm truncate">{job.farmer}</h4>
                      <Badge variant={job.urgency === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {job.urgency}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{job.crop} - {job.quantity}</p>
                    <p className="text-xs text-muted-foreground">{job.distance}</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-xs sm:text-sm">${job.payment}</p>
                    <Badge variant="outline" className="text-xs">
                      {job.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            {userType === 'farmer' ? (
              <>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col p-2 sm:p-4 text-xs sm:text-sm"
                  onClick={onNavigateToJobPosting}
                >
                  <Plus className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                  Post Job
                </Button>
                <Button variant="outline" className="h-auto flex-col p-2 sm:p-4 text-xs sm:text-sm">
                  <Clock className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                  Track Delivery
                </Button>
                <Button variant="outline" className="h-auto flex-col p-2 sm:p-4 text-xs sm:text-sm">
                  <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                  Payment History
                </Button>
                <Button variant="outline" className="h-auto flex-col p-2 sm:p-4 text-xs sm:text-sm">
                  <Star className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                  Rate Carrier
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col p-2 sm:p-4 text-xs sm:text-sm"
                  onClick={onNavigateToJobBrowser}
                >
                  <Search className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                  Find Jobs
                </Button>
                <Button variant="outline" className="h-auto flex-col p-2 sm:p-4 text-xs sm:text-sm">
                  <MapPin className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                  Set Route
                </Button>
                <Button variant="outline" className="h-auto flex-col p-2 sm:p-4 text-xs sm:text-sm">
                  <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                  Complete Delivery
                </Button>
                <Button variant="outline" className="h-auto flex-col p-2 sm:p-4 text-xs sm:text-sm">
                  <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
                  Earnings
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}