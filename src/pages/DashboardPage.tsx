import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import {
  Tractor,
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  LogOut,
  Bell,
  Settings,
  Plus,
  User
} from 'lucide-react';
import { authService } from '../services/api';

interface User {
  id: string;
  email: string;
  userType: 'farmer' | 'carrier';
  profile: any;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser as User);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const isFarmer = user.userType === 'farmer';
  const profile = user.profile;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Tractor className="h-6 w-6 text-green-600" />
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">AgriHaul</h1>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                  {isFarmer ? (
                    <Tractor className="h-4 w-4 text-green-600" />
                  ) : (
                    <Truck className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="text-sm font-medium">
                    {isFarmer ? 'Farmer' : 'Carrier'}
                  </span>
                </div>

                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {profile.farmName || profile.companyName || user.email}!
          </h2>
          <p className="text-gray-600">
            {isFarmer
              ? 'Manage your farm operations and find reliable carriers'
              : 'Find delivery jobs and manage your transportation services'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {isFarmer ? 'Active Jobs' : 'Completed Deliveries'}
                  </p>
                  <p className="text-2xl font-bold">
                    {isFarmer ? profile.totalJobs || 0 : profile.totalDeliveries || 0}
                  </p>
                </div>
                {isFarmer ? (
                  <Tractor className="h-8 w-8 text-green-600" />
                ) : (
                  <Truck className="h-8 w-8 text-blue-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rating</p>
                  <p className="text-2xl font-bold">{profile.rating || 'N/A'}</p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {profile.farmLocation || profile.serviceAreas?.[0] || 'Not set'}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {isFarmer ? 'Farm Size' : 'Vehicle Capacity'}
                  </p>
                  <p className="text-sm font-medium">
                    {isFarmer
                      ? `${profile.farmSize || 0} acres`
                      : `${profile.vehicleCapacity || 0} lbs`
                    }
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {isFarmer ? (
              <>
                <TabsTrigger value="jobs">My Jobs</TabsTrigger>
                <TabsTrigger value="create-job">Create Job</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="available-jobs">Available Jobs</TabsTrigger>
                <TabsTrigger value="my-bids">My Bids</TabsTrigger>
              </>
            )}
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Welcome to AgriHaul!</p>
                        <p className="text-xs text-gray-500">
                          {isFarmer
                            ? 'Start by creating your first job posting'
                            : 'Browse available delivery jobs in your area'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {isFarmer ? (
                      <>
                        <Button className="w-full justify-start" variant="outline">
                          <Plus className="mr-2 h-4 w-4" />
                          Create New Job
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <MapPin className="mr-2 h-4 w-4" />
                          Find Carriers
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <Users className="mr-2 h-4 w-4" />
                          View Bids
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button className="w-full justify-start" variant="outline">
                          <MapPin className="mr-2 h-4 w-4" />
                          Browse Jobs
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <DollarSign className="mr-2 h-4 w-4" />
                          Submit Bid
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <Truck className="mr-2 h-4 w-4" />
                          Update Vehicle Info
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value={isFarmer ? "jobs" : "available-jobs"}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {isFarmer ? 'My Job Postings' : 'Available Jobs'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    {isFarmer
                      ? 'No job postings yet. Create your first job to get started!'
                      : 'No jobs available in your area right now. Check back later!'
                    }
                  </p>
                  {isFarmer && (
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Job
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>

                <div>
                  <Label>User Type</Label>
                  <Badge variant={isFarmer ? "default" : "secondary"}>
                    {isFarmer ? 'Farmer' : 'Carrier'}
                  </Badge>
                </div>

                {isFarmer ? (
                  <>
                    <div>
                      <Label>Farm Name</Label>
                      <p className="text-sm text-gray-900">{profile.farmName || 'Not set'}</p>
                    </div>
                    <div>
                      <Label>Farm Size</Label>
                      <p className="text-sm text-gray-900">{profile.farmSize || 0} acres</p>
                    </div>
                    <div>
                      <Label>Primary Crops</Label>
                      <p className="text-sm text-gray-900">
                        {profile.primaryCrops?.join(', ') || 'Not set'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label>Company Name</Label>
                      <p className="text-sm text-gray-900">{profile.companyName || 'Not set'}</p>
                    </div>
                    <div>
                      <Label>Vehicle Type</Label>
                      <p className="text-sm text-gray-900">{profile.vehicleType || 'Not set'}</p>
                    </div>
                    <div>
                      <Label>Vehicle Capacity</Label>
                      <p className="text-sm text-gray-900">{profile.vehicleCapacity || 0} lbs</p>
                    </div>
                  </>
                )}

                <div>
                  <Label>Contact Phone</Label>
                  <p className="text-sm text-gray-900">{profile.contactPhone || 'Not set'}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Additional tabs content would go here */}
        </Tabs>
      </main>
    </div>
  );
}