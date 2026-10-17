/**
 * /buyer/orders-contracts — BuyerPortal component, unchanged.
 */
import React from 'react';
import { BuyerPortal } from '../../components/BuyerPortal';
import { useAppStore } from '../../services/useAppStore';

export default function BuyerOrdersContracts() {
  const darkMode = useAppStore((s) => s.darkMode);
  const orders   = useAppStore((s) => s.orders);
  const bookings = useAppStore((s) => s.bookings);
  const user     = useAppStore((s) => s.currentUser);

  return (
    <BuyerPortal
      orders={orders}
      bookings={bookings}
      user={user}
      darkMode={darkMode}
    />
  );
}
