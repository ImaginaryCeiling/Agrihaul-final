import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { ArrowLeft, Calendar as CalendarIcon, MapPin, Package, DollarSign, Clock } from 'lucide-react';

// Simple date formatter to replace date-fns
const formatDate = (date: Date | undefined, format: string = 'PPP') => {
  if (!date) return '';
  
  if (format === 'PPP') {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  if (format === 'MMM dd') {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  return date.toLocaleDateString();
};

interface JobPostingProps {
  onBack: () => void;
}

export function JobPosting({ onBack }: JobPostingProps) {
  const [formData, setFormData] = useState({
    cropType: '',
    quantity: '',
    unit: '',
    pickupAddress: '',
    deliveryAddress: '',
    pickupDate: undefined as Date | undefined,
    deliveryDate: undefined as Date | undefined,
    equipmentRequired: '',
    specialInstructions: '',
    estimatedPayment: '',
    urgency: 'medium'
  });

  const [estimatedDistance, setEstimatedDistance] = useState('');
  const [suggestedCarriers, setSuggestedCarriers] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would post the job to the backend
    alert('Job posted successfully! Carriers will be notified.');
    onBack();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Mock distance calculation when addresses change
    if (field === 'pickupAddress' || field === 'deliveryAddress') {
      if (formData.pickupAddress && formData.deliveryAddress) {
        setEstimatedDistance('42 miles');
        setSuggestedCarriers(5);
      }
    }
  };

  const cropTypes = [
    'Corn', 'Soybeans', 'Wheat', 'Rice', 'Barley', 'Oats', 
    'Cotton', 'Hay', 'Potatoes', 'Tomatoes', 'Other'
  ];

  const equipmentTypes = [
    'Grain Trailer', 'Flatbed Truck', 'Refrigerated Truck', 
    'Livestock Trailer', 'Tanker Truck', 'Box Truck'
  ];

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-7xl">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 w-fit text-sm sm:text-base">
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl sm:text-3xl text-foreground">Post New Job</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Job Details</CardTitle>
              <p className="text-sm sm:text-base text-muted-foreground">
                Provide details about your shipment to find the right carrier.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Crop Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="flex items-center gap-2 text-base sm:text-lg">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                    Cargo Information
                  </h3>
                  
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cropType" className="text-sm">Crop Type</Label>
                      <Select onValueChange={(value) => handleInputChange('cropType', value)}>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Select crop type" />
                        </SelectTrigger>
                        <SelectContent>
                          {cropTypes.map(crop => (
                            <SelectItem key={crop} value={crop.toLowerCase()}>{crop}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="equipmentRequired" className="text-sm">Equipment Required</Label>
                      <Select onValueChange={(value) => handleInputChange('equipmentRequired', value)}>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Select equipment type" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipmentTypes.map(equipment => (
                            <SelectItem key={equipment} value={equipment.toLowerCase()}>{equipment}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-sm">Quantity</Label>
                      <Input
                        id="quantity"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                        placeholder="500"
                        className="text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit" className="text-sm">Unit</Label>
                      <Select onValueChange={(value) => handleInputChange('unit', value)}>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bushels">Bushels</SelectItem>
                          <SelectItem value="tons">Tons</SelectItem>
                          <SelectItem value="pounds">Pounds</SelectItem>
                          <SelectItem value="pallets">Pallets</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="flex items-center gap-2 text-base sm:text-lg">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                    Pickup & Delivery
                  </h3>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pickupAddress" className="text-sm">Pickup Address</Label>
                      <Input
                        id="pickupAddress"
                        value={formData.pickupAddress}
                        onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                        placeholder="123 Farm Road, Rural County, State 12345"
                        className="text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryAddress" className="text-sm">Delivery Address</Label>
                      <Input
                        id="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                        placeholder="456 Market Street, City, State 67890"
                        className="text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Pickup Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left text-sm">
                            <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            {formData.pickupDate ? formatDate(formData.pickupDate, 'PPP') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.pickupDate}
                            onSelect={(date) => handleInputChange('pickupDate', date)}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Delivery Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left text-sm">
                            <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            {formData.deliveryDate ? formatDate(formData.deliveryDate, 'PPP') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.deliveryDate}
                            onSelect={(date) => handleInputChange('deliveryDate', date)}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                {/* Payment & Priority */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="flex items-center gap-2 text-base sm:text-lg">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                    Payment & Priority
                  </h3>
                  
                  <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estimatedPayment" className="text-sm">Estimated Payment ($)</Label>
                      <Input
                        id="estimatedPayment"
                        type="number"
                        value={formData.estimatedPayment}
                        onChange={(e) => handleInputChange('estimatedPayment', e.target.value)}
                        placeholder="850"
                        className="text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="urgency" className="text-sm">Priority Level</Label>
                      <Select onValueChange={(value) => handleInputChange('urgency', value)}>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Special Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="specialInstructions" className="text-sm">Special Instructions</Label>
                  <Textarea
                    id="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                    placeholder="Any special handling requirements, gate codes, contact information, etc."
                    className="min-h-[80px] sm:min-h-[100px] text-sm"
                  />
                </div>

                <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-sm sm:text-base py-2 sm:py-3" size="lg">
                  Post Job
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Job Summary Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Job Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {estimatedDistance && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Distance:</span>
                  <span>{estimatedDistance}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Matching Carriers:</span>
                <Badge variant="secondary" className="text-xs">{suggestedCarriers} available</Badge>
              </div>
              {formData.urgency && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Priority:</span>
                  <Badge variant={formData.urgency === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                    {formData.urgency}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                Estimated Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Job Posted:</span>
                  <span>Immediately</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Carrier Match:</span>
                  <span>Within 2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Pickup:</span>
                  <span>
                    {formData.pickupDate ? formatDate(formData.pickupDate, 'MMM dd') : 'TBD'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}