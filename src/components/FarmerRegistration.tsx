import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LeafletMap } from './LeafletMap';
import { ArrowLeft, Tractor, Loader2 } from 'lucide-react';
import { authService, ApiError } from '../services/api';
import { FarmerProfile } from '../../shared/types';

interface FarmerRegistrationProps {
  onComplete: () => void;
  onBack: () => void;
}

interface Location {
  lat: number;
  lng: number;
  address: string;
}

export function FarmerRegistration({ onComplete, onBack }: FarmerRegistrationProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    farmName: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    farmSize: '',
    cropTypes: '',
    operationDescription: '',
    experience: ''
  });

  const [farmLocation, setFarmLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!farmLocation) {
      setError('Please select your farm location on the map.');
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

    setIsLoading(true);

    try {
      // Prepare farmer profile data
      const farmerProfile: FarmerProfile = {
        farmName: formData.farmName,
        farmSize: parseInt(formData.farmSize) || 0,
        farmLocation: `${formData.address}, ${farmLocation.address}`,
        primaryCrops: formData.cropTypes.split(',').map(crop => crop.trim()).filter(Boolean),
        contactPhone: formData.phone,
        rating: 0,
        totalJobs: 0
      };

      // Register user
      const result = await authService.register({
        email: formData.email,
        password: formData.password,
        userType: 'farmer',
        profile: farmerProfile
      });

      console.log('Farmer registered successfully:', result);
      navigate('/dashboard');
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

  const handleLocationSelect = (location: Location) => {
    setFarmLocation(location);
    // Auto-fill address if it's more descriptive than coordinates
    if (location.address && !location.address.includes(',') === false) {
      setFormData(prev => ({ ...prev, address: location.address }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Tractor className="h-8 w-8 text-green-500" />
            <h1 className="text-2xl text-foreground">Farmer Registration</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Farm Location Map */}
          <LeafletMap
            title="Farm Location"
            description="Click on the map to select your farm's precise location. This helps carriers find you and plan optimal routes."
            onLocationSelect={handleLocationSelect}
            showRadius={false}
          />

          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create Your Farmer Profile</CardTitle>
              <p className="text-muted-foreground">
                Tell us about your farm to help carriers understand your logistics needs.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmName">Farm Name</Label>
                    <Input
                      id="farmName"
                      value={formData.farmName}
                      onChange={(e) => handleInputChange('farmName', e.target.value)}
                      placeholder="Green Valley Farm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name</Label>
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
                      placeholder="john@greenvalley.com"
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
                  <Label htmlFor="address">Farm Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Rural Road, Farm County, State 12345"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Address will be auto-filled when you select location on the map
                  </p>
                </div>

                {/* Farm Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="farmSize">Farm Size</Label>
                    <Select onValueChange={(value) => handleInputChange('farmSize', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select farm size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (1-50 acres)</SelectItem>
                        <SelectItem value="medium">Medium (51-200 acres)</SelectItem>
                        <SelectItem value="large">Large (201-500 acres)</SelectItem>
                        <SelectItem value="xlarge">Extra Large (500+ acres)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Select onValueChange={(value) => handleInputChange('experience', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-5">1-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="11-20">11-20 years</SelectItem>
                        <SelectItem value="20+">20+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cropTypes">Primary Crop Types</Label>
                  <Input
                    id="cropTypes"
                    value={formData.cropTypes}
                    onChange={(e) => handleInputChange('cropTypes', e.target.value)}
                    placeholder="Corn, Soybeans, Wheat"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operationDescription">Operation Description</Label>
                  <Textarea
                    id="operationDescription"
                    value={formData.operationDescription}
                    onChange={(e) => handleInputChange('operationDescription', e.target.value)}
                    placeholder="Describe your farming operation, typical harvest volumes, and logistics needs..."
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