import React from 'react';
import { Truck } from 'lucide-react';
import SectionLayout from './SectionLayout';

const NAV_ITEMS = [
  { to: '/transporter',                       label: 'Overview',           end: true },
  { to: '/transporter/shipments',             label: 'Shipments' },
  { to: '/transporter/route-optimization',    label: 'Route Optimization' },
];

export default function TransporterLayout() {
  return (
    <SectionLayout
      sectionLabel="Transporter"
      sectionColor="amber"
      navItems={NAV_ITEMS}
      icon={Truck}
    />
  );
}
