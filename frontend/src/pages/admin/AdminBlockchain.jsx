/**
 * /admin/blockchain — BlockchainExplorer component, unchanged.
 */
import React from 'react';
import { BlockchainExplorer } from '../../components/BlockchainExplorer';
import { useAppStore } from '../../services/useAppStore';
import { api } from '../../services/api';

export default function AdminBlockchain() {
  const darkMode = useAppStore((s) => s.darkMode);

  return (
    <BlockchainExplorer
      api={api}
      darkMode={darkMode}
    />
  );
}
