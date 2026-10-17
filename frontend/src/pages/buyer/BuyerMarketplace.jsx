/**
 * /buyer/marketplace — full Marketplace component, unchanged.
 */
import React from 'react';
import { Marketplace } from '../../components/Marketplace';
import { useAppStore } from '../../services/useAppStore';
import { api } from '../../services/api';

export default function BuyerMarketplace() {
  const darkMode    = useAppStore((s) => s.darkMode);
  const crops       = useAppStore((s) => s.crops);
  const user        = useAppStore((s) => s.currentUser);
  const refreshData = useAppStore((s) => s.refreshData);

  return (
    <Marketplace
      crops={crops}
      user={user}
      onOrderSuccess={refreshData}
      onBookingSuccess={refreshData}
      api={api}
      darkMode={darkMode}
    />
  );
}
