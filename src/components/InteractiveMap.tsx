import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { MapPin, Search, Plus, Minus } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface InteractiveMapProps {
  onLocationSelect: (location: Location, radius?: number) => void;
  showRadius?: boolean;
  initialRadius?: number;
  title: string;
  description: string;
}

export function InteractiveMap({ 
  onLocationSelect, 
  showRadius = false, 
  initialRadius = 50,
  title,
  description 
}: InteractiveMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [radius, setRadius] = useState(initialRadius);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(8);
  const [mapCenter, setMapCenter] = useState({ lat: 41.8781, lng: -87.6298 }); // Chicago default

  // Mock locations for demonstration
  const mockLocations = [
    { lat: 41.8781, lng: -87.6298, address: "Chicago, IL" },
    { lat: 40.7128, lng: -74.0060, address: "New York, NY" },
    { lat: 34.0522, lng: -118.2437, address: "Los Angeles, CA" },
    { lat: 29.7604, lng: -95.3698, address: "Houston, TX" },
    { lat: 41.2524, lng: -95.9980, address: "Omaha, NE" },
    { lat: 41.5868, lng: -93.6250, address: "Des Moines, IA" },
    { lat: 44.9778, lng: -93.2650, address: "Minneapolis, MN" }
  ];

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert click coordinates to lat/lng (mock calculation)
    const lat = mapCenter.lat + (rect.height / 2 - y) * (10 / rect.height) * (zoom / 8);
    const lng = mapCenter.lng + (x - rect.width / 2) * (20 / rect.width) * (zoom / 8);
    
    const newLocation: Location = {
      lat: parseFloat(lat.toFixed(4)),
      lng: parseFloat(lng.toFixed(4)),
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    };
    
    setSelectedLocation(newLocation);
    onLocationSelect(newLocation, showRadius ? radius : undefined);
  };

  const handleSearch = () => {
    // Mock search functionality
    const found = mockLocations.find(loc => 
      loc.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (found) {
      setSelectedLocation(found);
      setMapCenter({ lat: found.lat, lng: found.lng });
      onLocationSelect(found, showRadius ? radius : undefined);
    }
  };

  const handleRadiusChange = (newRadius: number[]) => {
    const radiusValue = newRadius[0];
    setRadius(radiusValue);
    if (selectedLocation) {
      onLocationSelect(selectedLocation, radiusValue);
    }
  };

  const zoomIn = () => setZoom(Math.min(zoom + 1, 12));
  const zoomOut = () => setZoom(Math.max(zoom - 1, 4));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Search for your location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="text-sm"
          />
          <Button onClick={handleSearch} variant="outline" size="sm" className="px-2 sm:px-3">
            <Search className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Map Container */}
        <div className="relative">
          <div 
            className="w-full h-[300px] sm:h-[400px] bg-slate-100 border rounded-lg cursor-crosshair relative overflow-hidden"
            onClick={handleMapClick}
            style={{
              backgroundImage: `linear-gradient(45deg, #f1f5f9 25%, transparent 25%), 
                               linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), 
                               linear-gradient(45deg, transparent 75%, #f1f5f9 75%), 
                               linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)`,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}
          >
            {/* Grid overlay to simulate map */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="absolute border-gray-300" 
                     style={{
                       left: `${i * 5}%`,
                       top: 0,
                       bottom: 0,
                       borderLeft: '1px solid'
                     }} 
                />
              ))}
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="absolute border-gray-300" 
                     style={{
                       top: `${i * 6.25}%`,
                       left: 0,
                       right: 0,
                       borderTop: '1px solid'
                     }} 
                />
              ))}
            </div>

            {/* Mock cities */}
            {mockLocations.map((location, index) => (
              <div
                key={index}
                className="absolute w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${50 + (location.lng - mapCenter.lng) * (50 / (zoom * 2))}%`,
                  top: `${50 - (location.lat - mapCenter.lat) * (50 / (zoom * 2))}%`
                }}
                title={location.address}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLocation(location);
                  onLocationSelect(location, showRadius ? radius : undefined);
                }}
              />
            ))}

            {/* Selected location marker */}
            {selectedLocation && (
              <>
                <div
                  className="absolute w-4 h-4 sm:w-6 sm:h-6 bg-red-500 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{
                    left: `${50 + (selectedLocation.lng - mapCenter.lng) * (50 / (zoom * 2))}%`,
                    top: `${50 - (selectedLocation.lat - mapCenter.lat) * (50 / (zoom * 2))}%`
                  }}
                >
                  <MapPin className="h-2 w-2 sm:h-4 sm:w-4 text-white" />
                </div>

                {/* Service radius circle for carriers */}
                {showRadius && (
                  <div
                    className="absolute border-2 border-green-500 border-dashed rounded-full bg-green-500 bg-opacity-10 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${50 + (selectedLocation.lng - mapCenter.lng) * (50 / (zoom * 2))}%`,
                      top: `${50 - (selectedLocation.lat - mapCenter.lat) * (50 / (zoom * 2))}%`,
                      width: `${radius * 2}px`,
                      height: `${radius * 2}px`,
                      maxWidth: '80%',
                      maxHeight: '80%'
                    }}
                  />
                )}
              </>
            )}

            {/* Zoom controls */}
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex flex-col gap-1 sm:gap-2">
              <Button onClick={zoomIn} size="sm" variant="outline" className="w-6 h-6 sm:w-8 sm:h-8 p-0">
                <Plus className="h-2 w-2 sm:h-4 sm:w-4" />
              </Button>
              <Button onClick={zoomOut} size="sm" variant="outline" className="w-6 h-6 sm:w-8 sm:h-8 p-0">
                <Minus className="h-2 w-2 sm:h-4 sm:w-4" />
              </Button>
            </div>

            {/* Map info */}
            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-white bg-opacity-90 px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm">
              Zoom: {zoom}x | Click to select location
            </div>
          </div>
        </div>

        {/* Radius slider for carriers */}
        {showRadius && (
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm">Service Radius: {radius} miles</Label>
            <Slider
              value={[radius]}
              onValueChange={handleRadiusChange}
              max={200}
              min={10}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
              <span>10 miles</span>
              <span>200 miles</span>
            </div>
          </div>
        )}

        {/* Selected location info */}
        {selectedLocation && (
          <div className="bg-muted p-2 sm:p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              <span className="text-xs sm:text-sm">Selected Location:</span>
            </div>
            <p className="text-xs sm:text-sm">{selectedLocation.address}</p>
            <p className="text-xs text-muted-foreground">
              Coordinates: {selectedLocation.lat}, {selectedLocation.lng}
            </p>
            {showRadius && (
              <p className="text-xs text-muted-foreground mt-1">
                Service area: {radius} mile radius
              </p>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
          💡 This is a mock interactive map. In production, this would integrate with Google Maps, Mapbox, or another mapping service for real location data and geocoding.
        </div>
      </CardContent>
    </Card>
  );
}