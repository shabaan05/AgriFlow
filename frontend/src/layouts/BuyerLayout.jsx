import React from 'react';
import { ShoppingCart } from 'lucide-react';
import SectionLayout from './SectionLayout';

const NAV_ITEMS = [
  { to: '/buyer',                  label: 'Overview',           end: true },
  { to: '/buyer/marketplace',      label: 'Marketplace' },
  { to: '/buyer/orders-contracts', label: 'Orders & Contracts' },
  { to: '/buyer/ai',               label: 'AI Decision Hub' },
];

export default function BuyerLayout() {
  return (
    <SectionLayout
      sectionLabel="Buyer"
      sectionColor="blue"
      navItems={NAV_ITEMS}
      icon={ShoppingCart}
    />
  );
}
