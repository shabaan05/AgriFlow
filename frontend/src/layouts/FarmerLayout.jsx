import React from 'react';
import { Wheat } from 'lucide-react';
import SectionLayout from './SectionLayout';

const NAV_ITEMS = [
  { to: '/farmer',                 label: 'Overview',        end: true },
  { to: '/farmer/crops',           label: 'My Crops' },
  { to: '/farmer/add-crop',        label: 'Add Crop' },
  { to: '/farmer/orders-bookings', label: 'Orders & Bookings' },
];

export default function FarmerLayout() {
  return (
    <SectionLayout
      sectionLabel="Farmer"
      sectionColor="emerald"
      navItems={NAV_ITEMS}
      icon={Wheat}
    />
  );
}
