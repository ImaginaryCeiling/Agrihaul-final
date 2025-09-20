import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FarmerRegistration } from '../components/FarmerRegistration';
import { CarrierRegistration } from '../components/CarrierRegistration';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tractor, Truck, ArrowLeft } from 'lucide-react';

type UserType = 'farmer' | 'carrier' | null;

export function RegisterPage() {
  const [selectedType, setSelectedType] = useState<UserType>(null);

  const handleRegistrationComplete = () => {
    // Registration success handled by individual components
    // They will redirect to dashboard
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  if (selectedType === 'farmer') {
    return <FarmerRegistration onComplete={handleRegistrationComplete} onBack={handleBack} />;
  }

  if (selectedType === 'carrier') {
    return <CarrierRegistration onComplete={handleRegistrationComplete} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Tractor className="h-6 w-6 text-green-600" />
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">AgriHaul</h1>
            </div>

            <Link to="/login">
              <Button variant="outline">
                Already have an account? Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join AgriHaul
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your role to get started. Whether you're a farmer looking for transportation
            or a carrier ready to help move agricultural products, we've got you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Farmer Registration */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-200">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Tractor className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl text-green-700">I'm a Farmer</CardTitle>
              <p className="text-gray-600">
                Post transportation jobs and find reliable carriers for your crops
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Post transportation needs</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Connect with verified carriers</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Track your shipments</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Manage farm logistics</span>
                </div>
              </div>

              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => setSelectedType('farmer')}
              >
                <Tractor className="mr-2 h-4 w-4" />
                Register as Farmer
              </Button>
            </CardContent>
          </Card>

          {/* Carrier Registration */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Truck className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-blue-700">I'm a Carrier</CardTitle>
              <p className="text-gray-600">
                Find transportation jobs and grow your delivery business
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Browse available jobs</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Bid on transportation contracts</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Manage your routes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Grow your business</span>
                </div>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => setSelectedType('carrier')}
              >
                <Truck className="mr-2 h-4 w-4" />
                Register as Carrier
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            By registering, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}