/**
 * /transporter/shipments — Full TransporterPortal (shipments + status updates).
 * TransporterPortal accepts: orders, user, onOrderUpdated, api, darkMode.
 * No initialView prop exists in that component — we just render it as-is.
 */
import React from 'react';
import { TransporterPortal } from '../../components/TransporterPortal';
import { useAppStore } from '../../services/useAppStore';
import { api } from '../../services/api';

export default function TransporterShipments() {
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
