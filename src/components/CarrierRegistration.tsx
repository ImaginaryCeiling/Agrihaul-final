import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, type ButtonProps } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { LeafletMap } from './LeafletMap';
import { ArrowLeft, Truck, Loader2 } from 'lucide-react';
import { authService, ApiError } from '../services/api';
import { CarrierProfile } from '../../shared/types';

interface CarrierRegistrationProps {
  onComplete: () => void;
  onBack: () => void;
}

interface Location {
  lat: number;
  lng: number;
  address: string;
}

export function CarrierRegistration({ onComplete, onBack }: CarrierRegistrationProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    licenseNumber: '',
    insuranceNumber: '',
    vehicleCapacity: '',
    vehicleType: '',
    truckTypes: [] as string[],
    serviceAreas: '',
    experience: '',
    equipmentDescription: ''
  });

  const [operatingLocation, setOperatingLocation] = useState<Location | null>(null);
  const [serviceRadius, setServiceRadius] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!operatingLocation) {
      setError('Please select your operating location and service area on the map.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.truckTypes.length === 0) {
      setError('Please select at least one vehicle type.');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare carrier profile data
      const carrierProfile: CarrierProfile = {
        companyName: formData.companyName,
        vehicleType: formData.vehicleType || formData.truckTypes[0],
        vehicleCapacity: parseInt(formData.vehicleCapacity) || 0,
        serviceAreas: formData.serviceAreas.split(',').map(area => area.trim()).filter(Boolean),
        contactPhone: formData.phone,
        rating: 0,
        totalDeliveries: 0,
        equipmentTypes: formData.truckTypes
      };

      // Register user
      const result = await authService.register({
        email: formData.email,
        password: formData.password,
        userType: 'carrier',
        profile: carrierProfile
      });

      console.log('Carrier registered successfully:', result);
      navigate('/dashboard/carrier');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTruckTypeToggle = (truckType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      truckTypes: checked 
        ? [...prev.truckTypes, truckType]
        : prev.truckTypes.filter(type => type !== truckType)
    }));
  };

  const handleLocationSelect = (location: Location, radius?: number) => {
    setOperatingLocation(location);
    if (radius !== undefined) {
      setServiceRadius(radius);
    }
    // Auto-fill address if it's more descriptive than coordinates
    if (location.address && !location.address.includes(',') === false) {
      setFormData(prev => ({ ...prev, address: location.address }));
    }
    // Update service areas description
    if (radius) {
      setFormData(prev => ({ 
        ...prev, 
        serviceAreas: `${radius}-mile radius from ${location.address}` 
      }));
    }
  };

  const truckTypeOptions = [
    'Grain Trailers',
    'Flatbed Trucks',
    'Refrigerated Trucks',
    'Livestock Trailers',
    'Tanker Trucks',
    'Box Trucks'
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <div className="mb-6 flex items-center gap-4">
          <Button onClick={onBack} className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Truck className="h-8 w-8 text-green-500" />
            <h1 className="text-2xl text-foreground">Carrier Registration</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Service Area Map */}
          <LeafletMap
            title="Operating Location & Service Area"
            description="Select your primary operating location and set your service radius. This determines which jobs you'll see and helps farmers find carriers in their area."
            onLocationSelect={handleLocationSelect}
            showRadius={true}
            initialRadius={50}
          />

          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create Your Carrier Profile</CardTitle>
              <p className="text-muted-foreground">
                Register your transportation business to start accepting delivery jobs.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6 max-h-[600px] overflow-y-auto">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Smith Transport LLC"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner/Manager Name</Label>
                    <Input
                      id="ownerName"
                      value={formData.ownerName}
                      onChange={(e) => handleInputChange('ownerName', e.target.value)}
                      placeholder="John Smith"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="john@smithtransport.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Re-enter password"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Industrial Blvd, City, State 12345"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Address will be auto-filled when you select location on the map
                  </p>
                </div>

                {/* Licensing & Insurance */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber"> License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      placeholder="123456"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceNumber">Insurance Policy Number</Label> 
                    <Input
                      id="insuranceNumber"
                      value={formData.insuranceNumber}
                      onChange={(e) => handleInputChange('insuranceNumber', e.target.value)}
                      placeholder="INS-789012"
                      required
                    />
                  </div>
                </div>

                {/* Fleet Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fleetSize">Fleet Size</Label>
                    <Select onValueChange={(value) => handleInputChange('fleetSize', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fleet size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 vehicle</SelectItem>
                        <SelectItem value="2-5">2-5 vehicles</SelectItem>
                        <SelectItem value="6-10">6-10 vehicles</SelectItem>
                        <SelectItem value="11-25">11-25 vehicles</SelectItem>
                        <SelectItem value="25+">25+ vehicles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years in Business</Label>
                    <Select onValueChange={(value) => handleInputChange('experience', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2">1-2 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Equipment Types */}
                <div className="space-y-3">
                  <Label>Equipment Types Available</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {truckTypeOptions.map(truckType => (
                      <div key={truckType} className="flex items-center space-x-2">
                        <Checkbox
                          id={truckType}
                          checked={formData.truckTypes.includes(truckType)}
                          onCheckedChange={(checked) => handleTruckTypeToggle(truckType, checked as boolean)}
                        />
                        <Label htmlFor={truckType} className="text-sm">{truckType}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">Primary Vehicle Type</Label>
                    <Select onValueChange={(value) => handleInputChange('vehicleType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="box-truck">Box Truck</SelectItem>
                        <SelectItem value="semi-truck">Semi-Truck</SelectItem>
                        <SelectItem value="flatbed">Flatbed Truck</SelectItem>
                        <SelectItem value="refrigerated">Refrigerated Truck</SelectItem>
                        <SelectItem value="dump-truck">Dump Truck</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleCapacity">Vehicle Capacity (lbs)</Label>
                    <Input
                      id="vehicleCapacity"
                      type="number"
                      value={formData.vehicleCapacity}
                      onChange={(e) => handleInputChange('vehicleCapacity', e.target.value)}
                      placeholder="80000"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceAreas">Service Areas</Label>
                  <Input
                    id="serviceAreas"
                    value={formData.serviceAreas}
                    onChange={(e) => handleInputChange('serviceAreas', e.target.value)}
                    placeholder="Will be filled automatically based on map selection"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Service area will be auto-filled based on your map selection
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipmentDescription">Equipment Description</Label>
                  <Textarea
                    id="equipmentDescription"
                    value={formData.equipmentDescription}
                    onChange={(e) => handleInputChange('equipmentDescription', e.target.value)}
                    placeholder="Describe your fleet capabilities, special equipment, and any certifications..."
                    className="min-h-[100px]"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}