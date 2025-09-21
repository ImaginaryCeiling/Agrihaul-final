import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { CarrierMap } from '../components/CarrierMap';
import { RatingDisplay, QuickRating } from '../components/RatingDisplay';
import { RatingInput } from '../components/RatingInput';
import { RatingManagement } from '../components/RatingManagement';
import { RatingRequest } from '../../shared/types';
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
  User,
  Eye,
  Save,
  Star
} from 'lucide-react';
import { authService, ratingService } from '../services/api';

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
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<{jobId: string, userId: string, userName: string, userType: 'farmer' | 'carrier'} | null>(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    cropType: '',
    quantity: '',
    unit: 'bushels',
    pickupLocation: '',
    deliveryLocation: '',
    pickupDate: '',
    deliveryDate: '',
    budget: '',
    equipmentRequired: [],
    specialInstructions: '',
    description: ''
  });
  const [mockBids] = useState([
    {
      id: '1',
      carrierId: 'carrier1',
      carrierName: 'Express Logistics',
      bidAmount: 450,
      estimatedDuration: 2,
      message: 'We have experience with corn transport and refrigerated trucks.',
      status: 'pending',
      rating: 4.8,
      vehicleType: 'Semi-truck with trailer'
    },
    {
      id: '2',
      carrierId: 'carrier2',
      carrierName: 'Farm Transport Co',
      bidAmount: 420,
      estimatedDuration: 3,
      message: 'Local carrier with 10+ years experience in agricultural transport.',
      status: 'pending',
      rating: 4.6,
      vehicleType: 'Grain truck'
    }
  ]);
  const [mockCompletedJobs] = useState([
    {
      id: 'job1',
      title: 'Corn Transport - Green Valley Farm',
      carrierName: 'Express Logistics',
      carrierId: 'carrier1',
      farmerId: 'farmer1',
      farmerName: 'John Smith',
      completedDate: '2024-01-15',
      amount: 450,
      status: 'completed',
      farmerRated: false,
      carrierRated: true
    },
    {
      id: 'job2',
      title: 'Soybean Transport - Sunset Acres',
      carrierName: 'Farm Transport Co',
      carrierId: 'carrier2',
      farmerId: 'farmer1',
      farmerName: 'John Smith',
      completedDate: '2024-01-10',
      amount: 320,
      status: 'completed',
      farmerRated: true,
      carrierRated: false
    }
  ]);

  const [mockCarriers] = useState([
    {
      id: '1',
      name: 'Express Logistics',
      location: { lat: 40.7128, lng: -74.0060 },
      vehicleType: 'Semi-truck',
      rating: 4.8,
      available: true
    },
    {
      id: '2',
      name: 'Farm Transport Co',
      location: { lat: 40.7589, lng: -73.9851 },
      vehicleType: 'Grain truck',
      rating: 4.6,
      available: true
    },
    {
      id: '3',
      name: 'Rural Delivery Services',
      location: { lat: 40.6892, lng: -74.0445 },
      vehicleType: 'Box truck',
      rating: 4.9,
      available: false
    }
  ]);

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

  const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Job posted:', jobForm);
    // Reset form
    setJobForm({
      title: '',
      cropType: '',
      quantity: '',
      unit: 'bushels',
      pickupLocation: '',
      deliveryLocation: '',
      pickupDate: '',
      deliveryDate: '',
      budget: '',
      equipmentRequired: [],
      specialInstructions: '',
      description: ''
    });
    setActiveTab('jobs');
  };

  const handleProfileEdit = () => {
    setShowProfileEdit(!showProfileEdit);
  };

  const handleRatingSubmit = async (rating: RatingRequest) => {
    try {
      // Submit rating to API
      await ratingService.submitRating(rating);
      console.log('Rating submitted successfully:', rating);

      // Update local state to reflect that rating was submitted
      // In a real app, you'd refresh the completed jobs data

      setShowRatingDialog(false);
      setRatingTarget(null);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      // Handle error - could show a toast notification
    }
  };

  const openRatingDialog = (jobId: string, userId: string, userName: string, userType: 'farmer' | 'carrier') => {
    setRatingTarget({ jobId, userId, userName, userType });
    setShowRatingDialog(true);
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

                <Button variant="ghost" size="sm" onClick={handleProfileEdit}>
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
                  <p className="text-sm font-medium text-gray-900 break-words">
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
                <TabsTrigger value="find-carriers">Find Carriers</TabsTrigger>
                <TabsTrigger value="view-bids">View Bids</TabsTrigger>
                <TabsTrigger value="completed-jobs">Completed Jobs</TabsTrigger>
                <TabsTrigger value="ratings">My Ratings</TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="available-jobs">Available Jobs</TabsTrigger>
                <TabsTrigger value="my-bids">My Bids</TabsTrigger>
                <TabsTrigger value="completed-jobs">Completed Jobs</TabsTrigger>
                <TabsTrigger value="ratings">My Ratings</TabsTrigger>
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
                        <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('create-job')}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create New Job
                        </Button>
                        <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('find-carriers')}>
                          <MapPin className="mr-2 h-4 w-4" />
                          Find Carriers
                        </Button>
                        <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('view-bids')}>
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
                    <Button onClick={() => setActiveTab('create-job')}>
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
                <div className="flex justify-between items-center">
                  <CardTitle>Profile Information</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleProfileEdit}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    {showProfileEdit ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showProfileEdit ? (
                  <>
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
                          <p className="text-sm text-gray-900 break-words">{profile.farmName || 'Not set'}</p>
                        </div>
                        <div>
                          <Label>Farm Size</Label>
                          <p className="text-sm text-gray-900">{profile.farmSize || 0} acres</p>
                        </div>
                        <div>
                          <Label>Farm Location</Label>
                          <p className="text-sm text-gray-900 break-words">{profile.farmLocation || 'Not set'}</p>
                        </div>
                        <div>
                          <Label>Primary Crops</Label>
                          <p className="text-sm text-gray-900 break-words">
                            {profile.primaryCrops?.join(', ') || 'Not set'}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label>Company Name</Label>
                          <p className="text-sm text-gray-900 break-words">{profile.companyName || 'Not set'}</p>
                        </div>
                        <div>
                          <Label>Vehicle Type</Label>
                          <p className="text-sm text-gray-900">{profile.vehicleType || 'Not set'}</p>
                        </div>
                        <div>
                          <Label>Vehicle Capacity</Label>
                          <p className="text-sm text-gray-900">{profile.vehicleCapacity || 0} lbs</p>
                        </div>
                        <div>
                          <Label>Service Areas</Label>
                          <p className="text-sm text-gray-900 break-words">
                            {profile.serviceAreas?.join(', ') || 'Not set'}
                          </p>
                        </div>
                        <div>
                          <Label>Equipment Types</Label>
                          <p className="text-sm text-gray-900 break-words">
                            {profile.equipmentTypes?.join(', ') || 'Not set'}
                          </p>
                        </div>
                      </>
                    )}

                    <div>
                      <Label>Contact Phone</Label>
                      <p className="text-sm text-gray-900">{profile.contactPhone || 'Not set'}</p>
                    </div>
                  </>
                ) : (
                  <form className="space-y-4" onSubmit={(e) => {
                    e.preventDefault();
                    setShowProfileEdit(false);
                    // Here you would typically save the profile changes
                  }}>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={user.email} disabled className="bg-gray-50" />
                    </div>

                    {isFarmer ? (
                      <>
                        <div>
                          <Label htmlFor="farmName">Farm Name</Label>
                          <Input
                            id="farmName"
                            defaultValue={profile.farmName || ''}
                            placeholder="Enter farm name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="farmSize">Farm Size (acres)</Label>
                          <Input
                            id="farmSize"
                            type="number"
                            defaultValue={profile.farmSize || ''}
                            placeholder="Enter farm size"
                          />
                        </div>
                        <div>
                          <Label htmlFor="farmLocation">Farm Location</Label>
                          <Input
                            id="farmLocation"
                            defaultValue={profile.farmLocation || ''}
                            placeholder="Enter farm location"
                          />
                        </div>
                        <div>
                          <Label htmlFor="primaryCrops">Primary Crops (comma-separated)</Label>
                          <Input
                            id="primaryCrops"
                            defaultValue={profile.primaryCrops?.join(', ') || ''}
                            placeholder="corn, soybeans, wheat"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label htmlFor="companyName">Company Name</Label>
                          <Input
                            id="companyName"
                            defaultValue={profile.companyName || ''}
                            placeholder="Enter company name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="vehicleType">Vehicle Type</Label>
                          <Select defaultValue={profile.vehicleType || ''}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select vehicle type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="semi-truck">Semi-truck</SelectItem>
                              <SelectItem value="grain-truck">Grain truck</SelectItem>
                              <SelectItem value="box-truck">Box truck</SelectItem>
                              <SelectItem value="flatbed">Flatbed</SelectItem>
                              <SelectItem value="refrigerated">Refrigerated truck</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="vehicleCapacity">Vehicle Capacity (lbs)</Label>
                          <Input
                            id="vehicleCapacity"
                            type="number"
                            defaultValue={profile.vehicleCapacity || ''}
                            placeholder="Enter vehicle capacity"
                          />
                        </div>
                        <div>
                          <Label htmlFor="serviceAreas">Service Areas (comma-separated)</Label>
                          <Input
                            id="serviceAreas"
                            defaultValue={profile.serviceAreas?.join(', ') || ''}
                            placeholder="County 1, County 2, City 3"
                          />
                        </div>
                        <div>
                          <Label htmlFor="equipmentTypes">Equipment Types (comma-separated)</Label>
                          <Input
                            id="equipmentTypes"
                            defaultValue={profile.equipmentTypes?.join(', ') || ''}
                            placeholder="refrigeration, grain handling, livestock"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input
                        id="contactPhone"
                        defaultValue={profile.contactPhone || ''}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowProfileEdit(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Job Tab */}
          <TabsContent value="create-job">
            <Card>
              <CardHeader>
                <CardTitle>Create New Job</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJobSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={jobForm.title}
                        onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                        placeholder="e.g., Corn Transport from Farm to Elevator"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cropType">Crop Type</Label>
                      <Select onValueChange={(value) => setJobForm({...jobForm, cropType: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select crop type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="corn">Corn</SelectItem>
                          <SelectItem value="soybeans">Soybeans</SelectItem>
                          <SelectItem value="wheat">Wheat</SelectItem>
                          <SelectItem value="oats">Oats</SelectItem>
                          <SelectItem value="barley">Barley</SelectItem>
                          <SelectItem value="rice">Rice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={jobForm.quantity}
                        onChange={(e) => setJobForm({...jobForm, quantity: e.target.value})}
                        placeholder="500"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Select onValueChange={(value) => setJobForm({...jobForm, unit: value})} defaultValue="bushels">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bushels">Bushels</SelectItem>
                          <SelectItem value="tons">Tons</SelectItem>
                          <SelectItem value="pounds">Pounds</SelectItem>
                          <SelectItem value="kilograms">Kilograms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="budget">Budget ($)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={jobForm.budget}
                        onChange={(e) => setJobForm({...jobForm, budget: e.target.value})}
                        placeholder="500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickupLocation">Pickup Location</Label>
                      <Input
                        id="pickupLocation"
                        value={jobForm.pickupLocation}
                        onChange={(e) => setJobForm({...jobForm, pickupLocation: e.target.value})}
                        placeholder="123 Farm Road, County, State"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryLocation">Delivery Location</Label>
                      <Input
                        id="deliveryLocation"
                        value={jobForm.deliveryLocation}
                        onChange={(e) => setJobForm({...jobForm, deliveryLocation: e.target.value})}
                        placeholder="456 Grain Elevator Rd, City, State"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickupDate">Pickup Date</Label>
                      <Input
                        id="pickupDate"
                        type="date"
                        value={jobForm.pickupDate}
                        onChange={(e) => setJobForm({...jobForm, pickupDate: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryDate">Delivery Date</Label>
                      <Input
                        id="deliveryDate"
                        type="date"
                        value={jobForm.deliveryDate}
                        onChange={(e) => setJobForm({...jobForm, deliveryDate: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      value={jobForm.description}
                      onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                      placeholder="Provide additional details about the job..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialInstructions">Special Instructions</Label>
                    <Textarea
                      id="specialInstructions"
                      value={jobForm.specialInstructions}
                      onChange={(e) => setJobForm({...jobForm, specialInstructions: e.target.value})}
                      placeholder="Any special handling requirements..."
                      rows={2}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Post Job
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Find Carriers Tab */}
          <TabsContent value="find-carriers">
            <CarrierMap
              onCarrierSelect={(carrier) => {
                console.log('Selected carrier:', carrier);
              }}
            />
          </TabsContent>

          {/* View Bids Tab */}
          <TabsContent value="view-bids">
            <Card>
              <CardHeader>
                <CardTitle>Job Bids</CardTitle>
              </CardHeader>
              <CardContent>
                {mockBids.length > 0 ? (
                  <div className="space-y-4">
                    {mockBids.map((bid) => (
                      <div key={bid.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-medium">{bid.carrierName}</h4>
                            <p className="text-sm text-gray-600">{bid.vehicleType}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-sm text-gray-600">Rating:</span>
                              <span className="text-sm font-medium">{bid.rating}/5</span>
                              <span className="text-yellow-400">★</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">${bid.bidAmount}</p>
                            <p className="text-sm text-gray-600">{bid.estimatedDuration} days</p>
                            <Badge variant="outline">{bid.status}</Badge>
                          </div>
                        </div>
                        {bid.message && (
                          <div className="bg-gray-50 rounded p-3 mb-3">
                            <p className="text-sm text-gray-700">{bid.message}</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Accept Bid
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="mr-1 h-3 w-3" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No bids received yet</p>
                    <p className="text-sm text-gray-400">Post a job to start receiving bids from carriers</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Bids Tab (for carriers) */}
          <TabsContent value="my-bids">
            <Card>
              <CardHeader>
                <CardTitle>My Bids</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sample carrier bids */}
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">Corn Transport - Green Valley Farm</h4>
                        <p className="text-sm text-gray-600">500 bushels • 45 miles</p>
                        <p className="text-sm text-gray-500">Pickup: Farm County → Market City</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">$450</p>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded p-3 mb-3">
                      <p className="text-sm text-blue-700">Your bid: $450 for 2-day delivery</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="mr-1 h-3 w-3" />
                      View Job Details
                    </Button>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">Soybean Transport - Sunset Acres</h4>
                        <p className="text-sm text-gray-600">300 bushels • 32 miles</p>
                        <p className="text-sm text-gray-500">Pickup: South County → Industrial Ave</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">$420</p>
                        <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded p-3 mb-3">
                      <p className="text-sm text-green-700">Congratulations! Your bid was accepted.</p>
                    </div>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Start Delivery
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completed Jobs Tab */}
          <TabsContent value="completed-jobs">
            <Card>
              <CardHeader>
                <CardTitle>Completed Jobs</CardTitle>
                <p className="text-sm text-gray-600">Rate your experience and view past collaborations</p>
              </CardHeader>
              <CardContent>
                {mockCompletedJobs.length > 0 ? (
                  <div className="space-y-4">
                    {mockCompletedJobs.map((job) => {
                      const canRateCarrier = isFarmer && !job.farmerRated;
                      const canRateFarmer = !isFarmer && !job.carrierRated;
                      const otherParty = isFarmer ? {
                        id: job.carrierId,
                        name: job.carrierName,
                        type: 'carrier' as const
                      } : {
                        id: job.farmerId,
                        name: job.farmerName,
                        type: 'farmer' as const
                      };

                      return (
                        <div key={job.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium">{job.title}</h4>
                              <p className="text-sm text-gray-600">
                                {isFarmer ? `Carrier: ${job.carrierName}` : `Farmer: ${job.farmerName}`}
                              </p>
                              <p className="text-sm text-gray-500">
                                Completed: {new Date(job.completedDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">${job.amount}</p>
                              <Badge className="bg-green-100 text-green-800">Completed</Badge>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-4">
                              {(canRateCarrier || canRateFarmer) ? (
                                <Button
                                  size="sm"
                                  onClick={() => openRatingDialog(
                                    job.id,
                                    otherParty.id,
                                    otherParty.name,
                                    otherParty.type
                                  )}
                                  className="bg-yellow-500 hover:bg-yellow-600"
                                >
                                  <Star className="mr-1 h-3 w-3" />
                                  Rate {otherParty.type === 'carrier' ? 'Carrier' : 'Farmer'}
                                </Button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Star className="h-4 w-4 text-green-500 fill-current" />
                                  <span className="text-sm text-green-600">Already rated</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="mr-1 h-3 w-3" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-4">No completed jobs yet</p>
                    <p className="text-sm text-gray-400">
                      {isFarmer
                        ? 'Complete your first job to start building your reputation'
                        : 'Complete your first delivery to start building your reputation'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ratings Tab */}
          <TabsContent value="ratings">
            <RatingManagement
              userId={user.id}
              userType={user.userType}
            />
          </TabsContent>

        </Tabs>

        {/* Rating Dialog */}
        {ratingTarget && (
          <RatingInput
            isOpen={showRatingDialog}
            onClose={() => {
              setShowRatingDialog(false);
              setRatingTarget(null);
            }}
            onSubmit={handleRatingSubmit}
            jobId={ratingTarget.jobId}
            ratedUserId={ratingTarget.userId}
            ratedUserName={ratingTarget.userName}
            ratedUserType={ratingTarget.userType}
          />
        )}
      </main>
    </div>
  );
}