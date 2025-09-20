import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Slider } from './ui/slider';
import { MapPin, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface LeafletMapProps {
  onLocationSelect: (location: Location, radius?: number) => void;
  showRadius?: boolean;
  initialRadius?: number;
  title: string;
  description: string;
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect, showRadius, radius }: {
  onLocationSelect: (location: Location, radius?: number) => void;
  showRadius?: boolean;
  radius: number;
}) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      const newLocation: Location = {
        lat: parseFloat(lat.toFixed(6)),
        lng: parseFloat(lng.toFixed(6)),
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      };
      onLocationSelect(newLocation, showRadius ? radius : undefined);
    }
  });
  return null;
}

export function LeafletMap({
  onLocationSelect,
  showRadius = false,
  initialRadius = 50,
  title,
  description
}: LeafletMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [radius, setRadius] = useState(initialRadius);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]); // Center of US
  const [zoom, setZoom] = useState(4);
  const mapRef = useRef<L.Map>(null);

  const handleLocationClick = useCallback((location: Location, newRadius?: number) => {
    setSelectedLocation(location);
    setMapCenter([location.lat, location.lng]);
    setZoom(10);
    onLocationSelect(location, newRadius ?? (showRadius ? radius : undefined));
  }, [onLocationSelect, showRadius, radius]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      // Using OpenStreetMap Nominatim for geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const address = result.display_name;

        const newLocation: Location = {
          lat,
          lng,
          address
        };

        handleLocationClick(newLocation);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handleRadiusChange = (newRadius: number[]) => {
    const radiusValue = newRadius[0];
    setRadius(radiusValue);
    if (selectedLocation) {
      onLocationSelect(selectedLocation, radiusValue);
    }
  };

  // Convert miles to meters for Leaflet Circle
  const radiusInMeters = radius * 1609.34;

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
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="text-sm"
          />
          <Button onClick={handleSearch} variant="outline" size="sm" className="px-2 sm:px-3">
            <Search className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Map Container */}
        <div className="w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden border">
          <MapContainer
            center={mapCenter}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler
              onLocationSelect={handleLocationClick}
              showRadius={showRadius}
              radius={radius}
            />

            {/* Selected location marker */}
            {selectedLocation && (
              <>
                <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                  <Popup>
                    <div>
                      <strong>Selected Location</strong><br />
                      {selectedLocation.address}<br />
                      {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                    </div>
                  </Popup>
                </Marker>

                {/* Service radius circle */}
                {showRadius && (
                  <Circle
                    center={[selectedLocation.lat, selectedLocation.lng]}
                    radius={radiusInMeters}
                    pathOptions={{
                      color: '#10b981',
                      fillColor: '#10b981',
                      fillOpacity: 0.1,
                      weight: 2,
                      dashArray: '5, 5'
                    }}
                  />
                )}
              </>
            )}
          </MapContainer>
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

        <div className="text-xs text-muted-foreground bg-green-50 p-2 rounded">
          🗺️ Interactive map powered by OpenStreetMap & Leaflet. Click anywhere to select a location or search for addresses.
        </div>
      </CardContent>
    </Card>
  );
}