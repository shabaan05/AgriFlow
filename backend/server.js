import express from 'express';
import dotenv from 'dotenv';
import connectDB, { memoryStore } from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import cropRoutes from './routes/cropRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import marketPriceRoutes from './routes/marketPriceRoutes.js';

// Seed demo data helper
import { seedInitialDataIfEmpty } from './seedData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ────────────────────────────────────────────────────────────────────
// Manual middleware placed FIRST — before every route and every other middleware.
// This guarantees CORS headers are present on ALL responses, including:
//   • OPTIONS preflight requests (which must return 204 immediately)
//   • Protected routes that run authMiddleware (protect/authorizeRoles)
//   • Error responses
//
// The cors() npm package with a callback can race on some Node/Express combos
// and auth middleware returns 401 on OPTIONS before headers are written — both
// problems are solved by handling it explicitly here.
// ─────────────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173', // Vite dev default
  'http://localhost:5174', // Vite dev fallback
  'http://localhost:4173', // Vite preview
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Only set the header when the request comes from an allowed origin.
  // Requests with no Origin header (curl, Postman, server-to-server) pass through.
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Preflight: return immediately with 204 — do NOT call next() or auth middleware.
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/market-prices', marketPriceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'AgriFlow AI - Smart Agricultural Supply Chain SaaS Platform',
    institution: 'DYPCET Kolhapur - CSE (Data Science)'
  });
});

// Start Server & Initialize Database
const startServer = async () => {
  try {
    await connectDB();
    await seedInitialDataIfEmpty();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🌾 AgriFlow AI Server running at http://localhost:${PORT}`);
      console.log(`📡 Endpoints active:`);
      console.log(`   - Auth & Users:      /api/auth`);
      console.log(`   - Crops Marketplace: /api/crops`);
      console.log(`   - Pre-Harvest Books: /api/bookings`);
      console.log(`   - Orders & Delivery: /api/orders`);
      console.log(`   - 6 AI Decision Hub: /api/ai`);
      console.log(`   - Blockchain Ledger: /api/ai/blockchain/ledger`);
      console.log(`   - Mandi Prices:      /api/market-prices`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error(`Failed to launch server: ${error.message}`);
  }
};

startServer();
