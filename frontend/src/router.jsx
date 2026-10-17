import { createBrowserRouter, Navigate } from 'react-router-dom';

// Entry
import SectionSelect from './pages/SectionSelect';

// Layouts
import FarmerLayout      from './layouts/FarmerLayout';
import BuyerLayout       from './layouts/BuyerLayout';
import TransporterLayout from './layouts/TransporterLayout';
import AdminLayout       from './layouts/AdminLayout';

// Farmer pages
import FarmerOverview       from './pages/farmer/FarmerOverview';
import FarmerCrops          from './pages/farmer/FarmerCrops';
import FarmerAddCrop        from './pages/farmer/FarmerAddCrop';
import FarmerOrdersBookings from './pages/farmer/FarmerOrdersBookings';

// Buyer pages
import BuyerOverview        from './pages/buyer/BuyerOverview';
import BuyerMarketplace     from './pages/buyer/BuyerMarketplace';
import BuyerOrdersContracts from './pages/buyer/BuyerOrdersContracts';
import BuyerAI              from './pages/buyer/BuyerAI';

// Transporter pages
import TransporterOverview          from './pages/transporter/TransporterOverview';
import TransporterShipments         from './pages/transporter/TransporterShipments';
import TransporterRouteOptimization from './pages/transporter/TransporterRouteOptimization';

// Admin pages
import AdminOverview    from './pages/admin/AdminOverview';
import AdminBlockchain  from './pages/admin/AdminBlockchain';
import AdminAI          from './pages/admin/AdminAI';
import AdminDocs        from './pages/admin/AdminDocs';

const router = createBrowserRouter([
  // ── Entry ──────────────────────────────────────────────
  {
    path: '/',
    element: <SectionSelect />,
  },

  // ── Farmer ─────────────────────────────────────────────
  {
    path: '/farmer',
    element: <FarmerLayout />,
    children: [
      { index: true,                    element: <FarmerOverview /> },
      { path: 'crops',                  element: <FarmerCrops /> },
      { path: 'add-crop',              element: <FarmerAddCrop /> },
      { path: 'orders-bookings',        element: <FarmerOrdersBookings /> },
    ],
  },

  // ── Buyer ───────────────────────────────────────────────
  {
    path: '/buyer',
    element: <BuyerLayout />,
    children: [
      { index: true,                    element: <BuyerOverview /> },
      { path: 'marketplace',            element: <BuyerMarketplace /> },
      { path: 'orders-contracts',       element: <BuyerOrdersContracts /> },
      { path: 'ai',                     element: <BuyerAI /> },
    ],
  },

  // ── Transporter ─────────────────────────────────────────
  {
    path: '/transporter',
    element: <TransporterLayout />,
    children: [
      { index: true,                    element: <TransporterOverview /> },
      { path: 'shipments',              element: <TransporterShipments /> },
      { path: 'route-optimization',     element: <TransporterRouteOptimization /> },
    ],
  },

  // ── Admin ───────────────────────────────────────────────
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true,                    element: <AdminOverview /> },
      { path: 'blockchain',             element: <AdminBlockchain /> },
      { path: 'ai',                     element: <AdminAI /> },
      { path: 'docs',                   element: <AdminDocs /> },
    ],
  },

  // ── Catch-all → back to section select ─────────────────
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
