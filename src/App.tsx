import React, { useState, useCallback, useMemo } from 'react';
import { LandingPage } from './components/LandingPage';
import { FarmerRegistration } from './components/FarmerRegistration';
import { CarrierRegistration } from './components/CarrierRegistration';
import { Dashboard } from './components/Dashboard';
import { JobPosting } from './components/JobPosting';
import { JobBrowser } from './components/JobBrowser';
import { Navigation } from './components/Navigation';

type Page = 'landing' | 'farmer-registration' | 'carrier-registration' | 'dashboard' | 'job-posting' | 'job-browser';
type UserType = 'farmer' | 'carrier' | null;

interface AppState {
  currentPage: Page;
  userType: UserType;
  isLoggedIn: boolean;
}

export default function App() {
  const [state, setState] = useState<AppState>({
    currentPage: 'landing',
    userType: null,
    isLoggedIn: false
  });

  // Use useCallback to prevent unnecessary re-renders
  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleRegistration = useCallback((type: 'farmer' | 'carrier') => {
    updateState({
      userType: type,
      isLoggedIn: true,
      currentPage: 'dashboard'
    });
  }, [updateState]);

  const handleLogin = useCallback(() => {
    updateState({
      userType: 'farmer', // Default to farmer for demo
      isLoggedIn: true,
      currentPage: 'dashboard'
    });
  }, [updateState]);

  const handleLogout = useCallback(() => {
    updateState({
      userType: null,
      isLoggedIn: false,
      currentPage: 'landing'
    });
  }, [updateState]);

  const handleNavigation = useCallback((page: Page) => {
    updateState({ currentPage: page });
  }, [updateState]);

  // Navigate to specific pages
  const navigateToFarmerRegistration = useCallback(() => {
    updateState({ currentPage: 'farmer-registration' });
  }, [updateState]);

  const navigateToCarrierRegistration = useCallback(() => {
    updateState({ currentPage: 'carrier-registration' });
  }, [updateState]);

  const navigateToLanding = useCallback(() => {
    updateState({ currentPage: 'landing' });
  }, [updateState]);

  const navigateToDashboard = useCallback(() => {
    updateState({ currentPage: 'dashboard' });
  }, [updateState]);

  const navigateToJobPosting = useCallback(() => {
    updateState({ currentPage: 'job-posting' });
  }, [updateState]);

  const navigateToJobBrowser = useCallback(() => {
    updateState({ currentPage: 'job-browser' });
  }, [updateState]);

  // Memoize the current page component to prevent unnecessary re-renders
  const currentPageComponent = useMemo(() => {
    switch (state.currentPage) {
      case 'landing':
        return (
          <LandingPage 
            onRegisterFarmer={navigateToFarmerRegistration}
            onRegisterCarrier={navigateToCarrierRegistration}
            onLogin={handleLogin}
          />
        );
      
      case 'farmer-registration':
        return (
          <FarmerRegistration 
            onComplete={() => handleRegistration('farmer')}
            onBack={navigateToLanding}
          />
        );
      
      case 'carrier-registration':
        return (
          <CarrierRegistration 
            onComplete={() => handleRegistration('carrier')}
            onBack={navigateToLanding}
          />
        );
      
      case 'dashboard':
        return (
          <Dashboard 
            userType={state.userType}
            onNavigateToJobPosting={navigateToJobPosting}
            onNavigateToJobBrowser={navigateToJobBrowser}
          />
        );
      
      case 'job-posting':
        return (
          <JobPosting 
            onBack={navigateToDashboard}
          />
        );
      
      case 'job-browser':
        return (
          <JobBrowser 
            userType={state.userType}
            onBack={navigateToDashboard}
          />
        );
      
      default:
        return (
          <LandingPage 
            onRegisterFarmer={navigateToFarmerRegistration}
            onRegisterCarrier={navigateToCarrierRegistration}
            onLogin={handleLogin}
          />
        );
    }
  }, [
    state.currentPage, 
    state.userType, 
    navigateToFarmerRegistration,
    navigateToCarrierRegistration,
    navigateToLanding,
    navigateToDashboard,
    navigateToJobPosting,
    navigateToJobBrowser,
    handleLogin,
    handleRegistration
  ]);

  return (
    <div className="min-h-screen bg-background">
      {state.isLoggedIn && (
        <Navigation 
          userType={state.userType}
          currentPage={state.currentPage}
          onNavigate={handleNavigation}
          onLogout={handleLogout}
        />
      )}
      {currentPageComponent}
    </div>
  );
}