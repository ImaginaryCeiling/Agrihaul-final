import React from 'react';
import { Button } from './ui/button';
import { Tractor, Truck, MapPin, Plus, Search, LogOut, Home } from 'lucide-react';

interface NavigationProps {
  userType: 'farmer' | 'carrier' | null;
  currentPage: string;
  onNavigate: (page: any) => void;
  onLogout: () => void;
}

export function Navigation({ userType, currentPage, onNavigate, onLogout }: NavigationProps) {
  return (
    <nav className="bg-card border-b border-border px-3 sm:px-6 py-3 sm:py-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {userType === 'farmer' ? (
            <Tractor className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
          ) : (
            <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
          )}
          <h1 className="text-lg sm:text-xl text-foreground">AgriHaul</h1>
          <span className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 py-1 rounded hidden sm:inline">
            {userType === 'farmer' ? 'Farmer' : 'Carrier'}
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            size="sm"
          >
            <Home className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>

          {userType === 'farmer' && (
            <Button
              variant={currentPage === 'job-posting' ? 'default' : 'ghost'}
              onClick={() => onNavigate('job-posting')}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              size="sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden md:inline">Post Job</span>
              <span className="md:hidden">Post</span>
            </Button>
          )}

          {userType === 'carrier' && (
            <Button
              variant={currentPage === 'job-browser' ? 'default' : 'ghost'}
              onClick={() => onNavigate('job-browser')}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              size="sm"
            >
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden md:inline">Find Jobs</span>
              <span className="md:hidden">Jobs</span>
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={onLogout}
            className="flex items-center gap-1 sm:gap-2 text-destructive hover:text-destructive text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            size="sm"
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}