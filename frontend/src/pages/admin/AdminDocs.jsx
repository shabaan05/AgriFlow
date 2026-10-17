/**
 * /admin/docs — AdminDashboard component (existing), unchanged.
 */
import React from 'react';
import { AdminDashboard } from '../../components/AdminDashboard';
import { useAppStore } from '../../services/useAppStore';
import { api } from '../../services/api';

export default function AdminDocs() {
  const darkMode = useAppStore((s) => s.darkMode);

  return (
    <AdminDashboard
      api={api}
      darkMode={darkMode}
    />
  );
}
