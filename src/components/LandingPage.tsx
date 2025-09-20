import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Truck, Tractor, MapPin, Clock, Shield, DollarSign, Users, BarChart3, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

export function LandingPage() {
  const [activeDialog, setActiveDialog] = useState<'about' | 'services' | null>(null);

  const handleNavClick = (section: 'about' | 'services' | 'contact') => {
    if (section === 'about') {
      setActiveDialog('about');
    } else if (section === 'services') {
      setActiveDialog('services');
    }
    // Contact stays blank as requested
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image - Made larger and more prominent */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1693925380807-81be3d1d7105?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtJTIwdHJhY3RvciUyMGZpZWxkJTIwYWdyaWN1bHR1cmV8ZW58MXx8fHwxNzU4Mzg1MDg3fDA&ixlib=rb-4.1.0&q=80&w=1920&utm_source=figma&utm_medium=referral')`
        }}
      />
      
      {/* Reduced overlay opacity to make image more prominent */}
      <div className="absolute inset-0 bg-background/70" />
      
      {/* Content */}
      <div className="relative flex flex-col min-h-screen">
        {/* Header */}
        <header className="w-full">
          <nav className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <Tractor className="h-8 w-8 sm:h-12 sm:w-12 text-green-500" />
              <h1 className="text-xl sm:text-2xl text-foreground">AgriHaul</h1>
            </div>
            <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
              <button 
                className="text-foreground hover:text-green-500 transition-colors duration-300" 
                onClick={() => handleNavClick('about')}
              >
                About
              </button>
              <button 
                className="text-foreground hover:text-green-500 transition-colors duration-300" 
                onClick={() => handleNavClick('services')}
              >
                Services
              </button>
              <button 
                className="text-foreground hover:text-green-500 transition-colors duration-300" 
                onClick={() => handleNavClick('contact')}
              >
                Contact
              </button>
              <Button
                variant="outline"
                asChild
                className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                size="sm"
              >
                <Link to="/login">Login</Link>
              </Button>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="outline"
                asChild
                className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                size="sm"
              >
                <Link to="/login">Login</Link>
              </Button>
            </div>
          </nav>
        </header>

        {/* Main Content - Expanded to take more space */}
        <main className="flex-grow flex items-center justify-center px-4 sm:px-6">
          <div className="container mx-auto py-16 sm:py-24 text-center">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl text-foreground mb-6 sm:mb-8 leading-tight">
                Seamless <span className="text-amber-500">Farm-to-Market</span> Logistics
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 sm:mb-16 max-w-4xl mx-auto px-4">
                Connect with reliable carriers and streamline your agricultural supply chain. 
                AgriHaul makes it easy to manage your logistics, from field to market.
              </p>
              
              {/* Registration Buttons */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 px-4">
                <Button
                  asChild
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white py-4 sm:py-5 px-8 sm:px-10 text-lg sm:text-xl transform hover:-translate-y-1 transition-all duration-300 min-w-[240px]"
                  size="lg"
                >
                  <Link to="/register" className="flex items-center">
                    <Tractor className="mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                    Register as Farmer
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white py-4 sm:py-5 px-8 sm:px-10 text-lg sm:text-xl transform hover:-translate-y-1 transition-all duration-300 min-w-[240px]"
                  size="lg"
                >
                  <Link to="/register" className="flex items-center">
                    <Truck className="mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                    Register as Carrier
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 text-center text-muted-foreground text-xs sm:text-sm">
            © 2024 AgriHaul. All Rights Reserved.
          </div>
        </footer>
      </div>

      {/* About Dialog */}
      <Dialog open={activeDialog === 'about'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-green-600 mb-4">About AgriHaul</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground">
              AgriHaul is a comprehensive farm-to-market logistics platform that revolutionizes 
              agricultural transportation by connecting farmers with reliable carriers through 
              intelligent matching and streamlined operations.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-foreground mb-2">Interactive Map Matching</h4>
                    <p className="text-sm text-muted-foreground">
                      Real-time geographic matching connects farmers with carriers based on location, 
                      service areas, and route optimization.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-6 w-6 text-amber-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-foreground mb-2">Instant Job Posting</h4>
                    <p className="text-sm text-muted-foreground">
                      Farmers can quickly post transportation jobs with detailed requirements, 
                      timelines, and cargo specifications.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-foreground mb-2">Crowdsourced Loading</h4>
                    <p className="text-sm text-muted-foreground">
                      Carriers can combine multiple small loads from different farmers 
                      to maximize efficiency and reduce costs.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-foreground mb-2">Digital AgriDocs</h4>
                    <p className="text-sm text-muted-foreground">
                      Secure digital documentation for proof of delivery, quality checks, 
                      and transaction records with blockchain verification.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <DollarSign className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-foreground mb-2">Instant Payments</h4>
                    <p className="text-sm text-muted-foreground">
                      Automated payment processing ensures carriers get paid immediately 
                      upon successful delivery confirmation.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <BarChart3 className="h-6 w-6 text-amber-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-foreground mb-2">Trust Scoring</h4>
                    <p className="text-sm text-muted-foreground">
                      Performance-based trust scores help build reliable partnerships 
                      and ensure quality service delivery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-green-800">
                <strong>Our Mission:</strong> To bridge the gap between agricultural production and market access 
                by providing farmers with reliable, efficient, and cost-effective transportation solutions 
                while empowering carriers with optimized routes and consistent work opportunities.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Services Dialog */}
      <Dialog open={activeDialog === 'services'} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-green-600 mb-4">Our Supply Chain Solutions</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground">
              AgriHaul provides comprehensive supply chain solutions that optimize every step 
              of the farm-to-market journey, ensuring fresh produce reaches consumers efficiently.
            </p>
            
            <div className="grid gap-6">
              <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                <div className="flex items-center gap-3 mb-4">
                  <Tractor className="h-8 w-8 text-green-600" />
                  <h3 className="text-xl text-green-800">Farm-Gate Collection</h3>
                </div>
                <p className="text-green-700 mb-4">
                  Coordinate pickup directly from farms with specialized agricultural vehicles 
                  equipped for different types of produce and livestock.
                </p>
                <ul className="list-disc list-inside text-sm text-green-600 space-y-1">
                  <li>Temperature-controlled transportation for perishables</li>
                  <li>Livestock trailers with proper ventilation and safety features</li>
                  <li>Bulk grain hauling with specialized equipment</li>
                  <li>Flexible scheduling around harvest times</li>
                </ul>
              </div>
              
              <div className="border border-amber-200 rounded-lg p-6 bg-amber-50">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="h-8 w-8 text-amber-600" />
                  <h3 className="text-xl text-amber-800">Regional Distribution</h3>
                </div>
                <p className="text-amber-700 mb-4">
                  Optimize routes through regional distribution centers, consolidating shipments 
                  and reducing transportation costs through strategic load planning.
                </p>
                <ul className="list-disc list-inside text-sm text-amber-600 space-y-1">
                  <li>Multi-farm consolidation for LTL (Less Than Truckload) efficiency</li>
                  <li>Cross-docking facilities for quick turnaround</li>
                  <li>Quality inspection and sorting services</li>
                  <li>Inventory management and storage solutions</li>
                </ul>
              </div>
              
              <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="h-8 w-8 text-blue-600" />
                  <h3 className="text-xl text-blue-800">Last-Mile Delivery</h3>
                </div>
                <p className="text-blue-700 mb-4">
                  Ensure fresh produce reaches retailers, restaurants, and consumers through 
                  optimized last-mile delivery networks with real-time tracking.
                </p>
                <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
                  <li>Urban delivery optimization for restaurants and retailers</li>
                  <li>Direct-to-consumer delivery for farm-fresh products</li>
                  <li>Cold chain maintenance throughout the journey</li>
                  <li>Proof of delivery with digital signatures and photos</li>
                </ul>
              </div>
              
              <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                  <h3 className="text-xl text-purple-800">Supply Chain Analytics</h3>
                </div>
                <p className="text-purple-700 mb-4">
                  Leverage data analytics to predict demand, optimize routes, and improve 
                  efficiency across the entire agricultural supply chain.
                </p>
                <ul className="list-disc list-inside text-sm text-purple-600 space-y-1">
                  <li>Demand forecasting based on market trends</li>
                  <li>Route optimization using AI and machine learning</li>
                  <li>Performance metrics and KPI tracking</li>
                  <li>Seasonal planning and capacity management</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-100 to-amber-100 p-6 rounded-lg border">
              <h4 className="text-lg text-foreground mb-3">End-to-End Visibility</h4>
              <p className="text-muted-foreground">
                Our platform provides complete transparency from farm to market, allowing all stakeholders 
                to track shipments, monitor quality, and ensure timely delivery. Real-time updates, 
                digital documentation, and automated notifications keep everyone informed throughout 
                the supply chain journey.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}