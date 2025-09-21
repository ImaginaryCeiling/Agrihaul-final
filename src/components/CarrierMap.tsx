import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { MapPin, Search, Truck, Star, Phone } from 'lucide-react';
import { QuickRating } from './RatingDisplay';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons for different states
const createCarrierIcon = (available: boolean) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: ${available ? '#10b981' : '#6b7280'};
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M8 6h13v12H8V6zm11 10V8H10v8h9zM5 6v12h1V6H5zm-2 0h1v12H3V6zm17 0v2h2V6h-2z"/>
        </svg>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

interface Carrier {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  vehicleType: string;
  rating: number;
  available: boolean;
  capacity: number;
  serviceRadius: number;
  contactPhone: string;
  equipment: string[];
  totalDeliveries: number;
}

interface CarrierMapProps {
  onCarrierSelect?: (carrier: Carrier) => void;
  searchLocation?: { lat: number; lng: number } | null;
}

export function CarrierMap({ onCarrierSelect, searchLocation }: CarrierMapProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([41.8781, -87.6298]); // Chicago
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Mock carrier data with realistic locations around Chicago/Midwest
  const [carriers] = useState<Carrier[]>([
    {
      id: '1',
      name: 'Midwest Express Logistics',
      location: { lat: 41.8781, lng: -87.6298 },
      vehicleType: 'Semi-truck with refrigerated trailer',
      rating: 4.8,
      available: true,
      capacity: 50000,
      serviceRadius: 150,
      contactPhone: '(555) 123-4567',
      equipment: ['Refrigeration', 'Grain handling', 'Bulk transport'],
      totalDeliveries: 284
    },
    {
      id: '2',
      name: 'Prairie Transport Co',
      location: { lat: 41.5868, lng: -93.6250 },
      vehicleType: 'Grain truck with trailer',
      rating: 4.6,
      available: true,
      capacity: 35000,
      serviceRadius: 200,
      contactPhone: '(555) 234-5678',
      equipment: ['Grain handling', 'Bulk transport'],
      totalDeliveries: 156
    },
    {
      id: '3',
      name: 'Heartland Hauling',
      location: { lat: 44.9778, lng: -93.2650 },
      vehicleType: 'Flatbed truck',
      rating: 4.9,
      available: false,
      capacity: 25000,
      serviceRadius: 100,
      contactPhone: '(555) 345-6789',
      equipment: ['Flatbed', 'Equipment transport'],
      totalDeliveries: 312
    },
    {
      id: '4',
      name: 'Farm Fresh Logistics',
      location: { lat: 40.8136, lng: -96.7026 },
      vehicleType: 'Box truck with lift gate',
      rating: 4.7,
      available: true,
      capacity: 15000,
      serviceRadius: 120,
      contactPhone: '(555) 456-7890',
      equipment: ['Lift gate', 'Climate control'],
      totalDeliveries: 198
    },
    {
      id: '5',
      name: 'Rural Route Express',
      location: { lat: 39.7391, lng: -104.9847 },
      vehicleType: 'Semi-truck with dry van',
      rating: 4.5,
      available: true,
      capacity: 40000,
      serviceRadius: 300,
      contactPhone: '(555) 567-8901',
      equipment: ['Dry van', 'Long haul'],
      totalDeliveries: 427
    },
    {
      id: '6',
      name: 'Green Valley Transport',
      location: { lat: 42.3601, lng: -71.0589 },
      vehicleType: 'Livestock trailer',
      rating: 4.4,
      available: false,
      capacity: 20000,
      serviceRadius: 80,
      contactPhone: '(555) 678-9012',
      equipment: ['Livestock', 'Ventilation'],
      totalDeliveries: 89
    }
  ]);

  const filteredCarriers = carriers.filter(carrier =>
    (!showOnlyAvailable || carrier.available) &&
    (searchQuery === '' ||
     carrier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     carrier.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    if (searchLocation) {
      setMapCenter([searchLocation.lat, searchLocation.lng]);
    }
  }, [searchLocation]);

  const handleCarrierClick = (carrier: Carrier) => {
    setSelectedCarrier(carrier);
    setMapCenter([carrier.location.lat, carrier.location.lng]);
    onCarrierSelect?.(carrier);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      // Using OpenStreetMap Nominatim for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        setMapCenter([lat, lng]);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Find Carriers Near You
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search carriers or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="availableOnly"
              checked={showOnlyAvailable}
              onChange={(e) => setShowOnlyAvailable(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="availableOnly" className="text-sm">
              Show only available carriers
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div className="h-[500px] w-full">
            <MapContainer
              center={mapCenter}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
              className="rounded-lg"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Carrier markers */}
              {filteredCarriers.map((carrier) => (
                <React.Fragment key={carrier.id}>
                  <Marker
                    position={[carrier.location.lat, carrier.location.lng]}
                    icon={createCarrierIcon(carrier.available)}
                    eventHandlers={{
                      click: () => handleCarrierClick(carrier)
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-sm">{carrier.name}</h3>
                          <Badge variant={carrier.available ? "default" : "secondary"}>
                            {carrier.available ? 'Available' : 'Busy'}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            <span>{carrier.vehicleType}</span>
                          </div>

                          <QuickRating
                            rating={carrier.rating}
                            totalRatings={carrier.totalDeliveries}
                            variant="compact"
                          />

                          <div className="flex items-center gap-1">
                            <span className="font-medium">Capacity:</span>
                            <span>{carrier.capacity.toLocaleString()} lbs</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="font-medium">Service radius:</span>
                            <span>{carrier.serviceRadius} miles</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{carrier.contactPhone}</span>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t">
                          <Button
                            size="sm"
                            className="w-full"
                            disabled={!carrier.available}
                          >
                            Contact Carrier
                          </Button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Service radius circle for selected carrier */}
                  {selectedCarrier?.id === carrier.id && (
                    <Circle
                      center={[carrier.location.lat, carrier.location.lng]}
                      radius={carrier.serviceRadius * 1609.34} // Convert miles to meters
                      pathOptions={{
                        color: carrier.available ? '#10b981' : '#6b7280',
                        fillColor: carrier.available ? '#10b981' : '#6b7280',
                        fillOpacity: 0.1,
                        weight: 2,
                        dashArray: '5, 5'
                      }}
                    />
                  )}
                </React.Fragment>
              ))}

              {/* Search location marker if provided */}
              {searchLocation && (
                <Marker position={[searchLocation.lat, searchLocation.lng]}>
                  <Popup>
                    <div className="text-center">
                      <strong>Your Location</strong>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Carrier list */}
      <Card>
        <CardHeader>
          <CardTitle>Available Carriers ({filteredCarriers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredCarriers.map((carrier) => (
              <div
                key={carrier.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedCarrier?.id === carrier.id ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleCarrierClick(carrier)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{carrier.name}</h4>
                    <p className="text-sm text-gray-600">{carrier.vehicleType}</p>
                  </div>
                  <Badge variant={carrier.available ? "default" : "secondary"}>
                    {carrier.available ? 'Available' : 'Busy'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                  <QuickRating
                    rating={carrier.rating}
                    totalRatings={carrier.totalDeliveries}
                    variant="compact"
                  />
                  <div>
                    <span className="font-medium">{carrier.totalDeliveries}</span> deliveries
                  </div>
                  <div>
                    <span className="font-medium">{carrier.capacity.toLocaleString()}</span> lbs capacity
                  </div>
                  <div>
                    <span className="font-medium">{carrier.serviceRadius}</span> mile radius
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {carrier.equipment.map((eq, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {eq}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{carrier.contactPhone}</span>
                  <Button
                    size="sm"
                    disabled={!carrier.available}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle contact carrier
                    }}
                  >
                    Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}