/**
 * /transporter/route-optimization
 * Dedicated route optimization page — embeds the existing TransporterPortal
 * which already contains the AI Route Optimization button and result panel.
 * The portal renders the full shipment list + the optimization panel together,
 * which is the correct existing UX (the route results appear above the list).
 */
import React from 'react';
import { TransporterPortal } from '../../components/TransporterPortal';
import { useAppStore } from '../../services/useAppStore';
import { api } from '../../services/api';

export default function TransporterRouteOptimization() {
  const darkMode    = useAppStore((s) => s.darkMode);
  const orders      = useAppStore((s) => s.orders);
  const user        = useAppStore((s) => s.currentUser);
  const refreshData = useAppStore((s) => s.refreshData);

  return (
    <TransporterPortal
      orders={orders}
      user={user}
      onOrderUpdated={refreshData}
      api={api}
      darkMode={darkMode}
    />
  );
}
