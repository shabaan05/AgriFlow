/**
 * App.jsx
 *
 * Root wrapper — provides:
 *   • LanguageProvider  (i18n context)
 *   • initApp() on mount (loads quick-accounts + seeds Zustand data)
 *   • RouterProvider    (react-router-dom v7 data router)
 *
 * The old tab-based shell (Navbar, LandingPage, footer, AuthModal rendered
 * here) has been moved into the role-section layouts / pages.
 * All existing components (FarmerPortal, Marketplace, etc.) are untouched.
 */
import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { LanguageProvider } from './services/LanguageContext';
import { useAppStore } from './services/useAppStore';

function AppInit({ router }) {
  const initApp = useAppStore((state) => state.initApp);

  useEffect(() => {
    initApp();
  }, [initApp]);

  return <RouterProvider router={router} />;
}

export default function App({ router }) {
  return (
    <LanguageProvider>
      <AppInit router={router} />
    </LanguageProvider>
  );
}
