import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Package, 
  Clock, 
  DollarSign, 
  Star,
  Filter,
  Route,
  Calendar
} from 'lucide-react';

interface JobBrowserProps {
  userType: 'farmer' | 'carrier' | null;
  onBack: () => void;
}

export function JobBrowser({ userType, onBack }: JobBrowserProps) {
  const [searchFilters, setSearchFilters] = useState({
    location: '',
    cropType: '',
    equipmentType: '',
    maxDistance: '',
    minPayment: '',
    urgency: ''
  });

  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [crowdsourcingMode, setCrowdsourcingMode] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);

  // Mock job data
  const mockJobs = [
    {
      id: 1,
      farmer: "Green Valley Farm",
      farmerRating: 4.8,
      crop: "Corn",
      quantity: "500 bushels",
      pickup: "Rural Rd 123, Farm County, IA",
      delivery: "Grain Elevator, Market City, IA",
      pickupDate: "Oct 25, 2024",
      deliveryDate: "Oct 26, 2024",
      distance: "45 miles",
      payment: 850,
      urgency: "high",
      equipment: "Grain Trailer",
      description: "Standard corn delivery from farm to grain elevator. Easy loading access.",
      trustScore: 92
    },
    {
      id: 2,
      farmer: "Sunset Acres",
      farmerRating: 4.6,
      crop: "Soybeans",
      quantity: "300 bushels",
      pickup: "Highway 67, South County, IA",
      delivery: "Processing Plant, Industrial Ave, IA",
      pickupDate: "Oct 24, 2024",
      deliveryDate: "Oct 25, 2024",
      distance: "32 miles",
      payment: 620,
      urgency: "medium",
      equipment: "Grain Trailer",
      description: "Soybean transport to processing facility. Covered loading dock available.",
      trustScore: 88
    },
    {
      id: 3,
      farmer: "Prairie View Ranch",
      farmerRating: 4.9,
      crop: "Wheat",
      quantity: "200 bushels",
      pickup: "County Road 45, West Fields, IA",
      delivery: "Miller's Co-op, Main Street, IA",
      pickupDate: "Oct 23, 2024",
      deliveryDate: "Oct 24, 2024",
      distance: "28 miles",
      payment: 450,
      urgency: "low",
      equipment: "Grain Trailer",
      description: "Small wheat load, perfect for filling partial capacity. Quick turnaround.",
      trustScore: 95
    },
    {
      id: 4,
      farmer: "Riverside Farms",
      farmerRating: 4.7,
      crop: "Potatoes",
      quantity: "15 tons",
      pickup: "Farm Road 78, River Valley, IA",
      delivery: "Food Processing Inc, Business Park, IA",
      pickupDate: "Oct 26, 2024",
      deliveryDate: "Oct 27, 2024",
      distance: "65 miles",
      payment: 1200,
      urgency: "high",
      equipment: "Refrigerated Truck",
      description: "Temperature-controlled transport required. Premium produce shipment.",
      trustScore: 89
    }
  ];

  const handleJobSelect = (jobId: number) => {
    if (crowdsourcingMode) {
      setSelectedJobs(prev => 
        prev.includes(jobId) 
          ? prev.filter(id => id !== jobId)
          : [...prev, jobId]
      );
    } else {
      setSelectedJob(jobId);
    }
  };

  const handleAcceptJob = (jobId: number) => {
    if (crowdsourcingMode && selectedJobs.length > 0) {
      alert(`Route created with ${selectedJobs.length} jobs! Total estimated earnings: $${selectedJobs.reduce((sum, id) => sum + (mockJobs.find(j => j.id === id)?.payment || 0), 0)}`);
    } else {
      const job = mockJobs.find(j => j.id === jobId);
      alert(`Job accepted! You'll earn $${job?.payment} for this delivery.`);
    }
    onBack();
  };

  const getTotalPayment = () => {
    return selectedJobs.reduce((sum, id) => {
      const job = mockJobs.find(j => j.id === id);
      return sum + (job?.payment || 0);
    }, 0);
  };

  const getTotalDistance = () => {
    return selectedJobs.reduce((sum, id) => {
      const job = mockJobs.find(j => j.id === id);
      return sum + parseInt(job?.distance?.replace(' miles', '') || '0');
    }, 0);
  };

  return (
    <div className="container mx-auto p-3 sm:p-6">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 sm:gap-4 mb-2">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 text-sm sm:text-base">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl sm:text-3xl text-foreground">Available Jobs</h1>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button
            variant={crowdsourcingMode ? 'default' : 'outline'}
            onClick={() => setCrowdsourcingMode(!crowdsourcingMode)}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
            size="sm"
          >
            <Route className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{crowdsourcingMode ? 'Exit Route Mode' : 'Create Route'}</span>
            <span className="sm:hidden">{crowdsourcingMode ? 'Exit' : 'Route'}</span>
          </Button>
        </div>
      </div>

      {crowdsourcingMode && (
        <Card className="mb-4 sm:mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg mb-2">Route Planning Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Select multiple jobs to create an optimized delivery route. 
                  Selected: {selectedJobs.length} jobs
                </p>
              </div>
              {selectedJobs.length > 0 && (
                <div className="text-center sm:text-right">
                  <div className="text-xl sm:text-2xl text-green-600">${getTotalPayment()}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{getTotalDistance()} total miles</div>
                  <Button 
                    onClick={() => handleAcceptJob(0)}
                    className="mt-2 bg-green-500 hover:bg-green-600 text-sm px-3 py-2"
                    size="sm"
                  >
                    Create Route
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Filters Sidebar */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm">Location</Label>
              <Input
                id="location"
                placeholder="City, State"
                value={searchFilters.location}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cropType" className="text-sm">Crop Type</Label>
              <Select onValueChange={(value) => setSearchFilters(prev => ({ ...prev, cropType: value }))}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Any crop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corn">Corn</SelectItem>
                  <SelectItem value="soybeans">Soybeans</SelectItem>
                  <SelectItem value="wheat">Wheat</SelectItem>
                  <SelectItem value="potatoes">Potatoes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment" className="text-sm">Equipment Type</Label>
              <Select onValueChange={(value) => setSearchFilters(prev => ({ ...prev, equipmentType: value }))}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Any equipment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grain">Grain Trailer</SelectItem>
                  <SelectItem value="flatbed">Flatbed</SelectItem>
                  <SelectItem value="refrigerated">Refrigerated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxDistance" className="text-sm">Max Distance</Label>
              <Select onValueChange={(value) => setSearchFilters(prev => ({ ...prev, maxDistance: value }))}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Any distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">Within 25 miles</SelectItem>
                  <SelectItem value="50">Within 50 miles</SelectItem>
                  <SelectItem value="100">Within 100 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minPayment" className="text-sm">Min Payment</Label>
              <Input
                id="minPayment"
                type="number"
                placeholder="$500"
                value={searchFilters.minPayment}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, minPayment: e.target.value }))}
                className="text-sm"
              />
            </div>

            <Button className="w-full text-sm" variant="outline" size="sm">
              Apply Filters
            </Button>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div className="lg:col-span-3 space-y-3 sm:space-y-4">
          {mockJobs.map(job => (
            <Card 
              key={job.id} 
              className={`cursor-pointer transition-all ${
                selectedJob === job.id || selectedJobs.includes(job.id)
                  ? 'ring-2 ring-green-500 bg-green-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleJobSelect(job.id)}
            >
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg">{job.farmer}</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
                          <span className="text-xs sm:text-sm">{job.farmerRating}</span>
                        </div>
                        <Badge variant={job.urgency === 'high' ? 'destructive' : job.urgency === 'medium' ? 'default' : 'secondary'} className="text-xs">
                          {job.urgency} priority
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 sm:mb-3">{job.description}</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-xl sm:text-2xl text-green-600 mb-1">${job.payment}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{job.distance}</div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground mt-1" />
                      <div>
                        <div className="text-xs sm:text-sm">{job.crop} - {job.quantity}</div>
                        <div className="text-xs text-muted-foreground">Requires: {job.equipment}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground mt-1" />
                      <div>
                        <div className="text-xs sm:text-sm">Pickup: {job.pickup}</div>
                        <div className="text-xs sm:text-sm">Delivery: {job.delivery}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      <div className="text-xs sm:text-sm">
                        Pickup: {job.pickupDate}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      <div className="text-xs sm:text-sm">
                        Deliver by: {job.deliveryDate}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-3 sm:my-4" />

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-xs sm:text-sm">
                      Trust Score: <span className="text-green-600">{job.trustScore}%</span>
                    </div>
                    {crowdsourcingMode && selectedJobs.includes(job.id) && (
                      <Badge variant="secondary" className="text-xs">Selected for route</Badge>
                    )}
                  </div>
                  {!crowdsourcingMode && selectedJob === job.id && (
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptJob(job.id);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-sm px-3 py-2"
                      size="sm"
                    >
                      Accept Job
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}