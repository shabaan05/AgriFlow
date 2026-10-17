import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import SectionLayout from './SectionLayout';

const NAV_ITEMS = [
  { to: '/admin',             label: 'Overview',    end: true },
  { to: '/admin/blockchain',  label: 'Blockchain' },
  { to: '/admin/ai',          label: 'AI Hub' },
  { to: '/admin/docs',        label: 'Project Docs' },
];

export default function AdminLayout() {
  return (
    <SectionLayout
      sectionLabel="Admin"
      sectionColor="purple"
      navItems={NAV_ITEMS}
      icon={LayoutDashboard}
    />
  );
}
