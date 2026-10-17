/**
 * /admin/ai — AIDecisionHub component, unchanged.
 */
import React from 'react';
import { AIDecisionHub } from '../../components/AIDecisionHub';
import { useAppStore } from '../../services/useAppStore';
import { api } from '../../services/api';

export default function AdminAI() {
  const darkMode = useAppStore((s) => s.darkMode);

  return (
    <AIDecisionHub
      api={api}
      darkMode={darkMode}
    />
  );
}
