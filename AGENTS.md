# AgriFlow AI — Agent & Developer Context Guide

> Read this file before starting any task on this project.
> It exists to prevent re-analysis from scratch and keep development consistent.

---

## What this project is

**AgriFlow AI** is a Smart Agricultural Supply Chain SaaS Platform (MERN stack).
It connects Farmers, Buyers, and Transporters with role-based dashboards,
a crop marketplace, pre-harvest booking/contracts, order management, an
in-process AI engine, and a custom SHA-256 blockchain for traceability.

**Institution:** DYPCET Kolhapur — B.Tech CSE (Data Science) — 2026

---

## Current development priority

> **Make the existing application stable, reliable, and demo-ready at the basic application level.**

Priority order — work top-down, do not skip ahead:

1. Stable and consistent UI
2. Authentication and role flow
3. All CRUD operations working end-to-end
4. Frontend ↔ Backend API integration
5. MongoDB persistence (data survives restart)
6. Correct database relationships
7. Form validation
8. Loading states
9. Error handling
10. Empty states
11. Refresh / state synchronisation
12. Route / navigation stability
13. _(only after all above)_ AI and Blockchain feature work

**Do NOT spend time on:**
- AI Buyer Matching algorithms
- AI Demand Forecasting
- AI Shelf-Life intelligence
- AI Wastage Prevention
- AI Transport Optimization
- Blockchain hashing or chain visualization

These features exist and can stay. They are not the current priority.

---

## Tech stack

| Layer | Tech |
|---|---|
| Backend runtime | Node.js + Express 4 (ES modules `"type":"module"`) |
| Database | MongoDB Atlas + Mongoose 8 |
| DB fallback | In-memory store (dev only — not persistent) |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| Frontend | React 19 + Vite 8 |
| Routing | React Router v7 (`createBrowserRouter`) |
| State | Zustand 5 |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| i18n | Custom React Context (`LanguageContext.jsx`) — EN / MR / HI |

---

## Project structure

```
AgriFlow-AI-main/
├── backend/
│   ├── server.js               ← entry point, CORS, route mounting
│   ├── .env                    ← MONGODB_URI, JWT_SECRET, PORT, NODE_ENV
│   ├── config/db.js            ← MongoDB connect + memoryStore fallback
│   ├── middleware/authMiddleware.js  ← protect(), authorizeRoles()
│   ├── models/                 ← Mongoose schemas
│   │   ├── User.js
│   │   ├── Crop.js
│   │   ├── Order.js
│   │   ├── Booking.js
│   │   └── BlockchainBlock.js
│   ├── routes/                 ← Express route handlers
│   │   ├── authRoutes.js
│   │   ├── cropRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── orderRoutes.js
│   │   └── aiRoutes.js
│   ├── services/
│   │   ├── aiAgentsService.js  ← 6 AI agent functions (pure JS)
│   │   └── blockchainService.js
│   └── seedData.js             ← demo data seeded on first startup
│
└── frontend/
    ├── src/
    │   ├── App.jsx             ← root wrapper: LanguageProvider + RouterProvider
    │   ├── main.jsx            ← ReactDOM entry
    │   ├── router.jsx          ← all routes via createBrowserRouter
    │   ├── layouts/            ← SectionLayout + 4 role layouts
    │   │   ├── SectionLayout.jsx
    │   │   ├── FarmerLayout.jsx
    │   │   ├── BuyerLayout.jsx
    │   │   ├── TransporterLayout.jsx
    │   │   └── AdminLayout.jsx
    │   ├── pages/              ← route-level pages (thin wrappers + overview pages)
    │   │   ├── SectionSelect.jsx     ← entry point: pick role
    │   │   ├── farmer/
    │   │   ├── buyer/
    │   │   ├── transporter/
    │   │   └── admin/
    │   ├── components/         ← reusable feature components
    │   │   ├── FarmerPortal.jsx
    │   │   ├── Marketplace.jsx
    │   │   ├── BuyerPortal.jsx
    │   │   ├── TransporterPortal.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── AIDecisionHub.jsx
    │   │   ├── BlockchainExplorer.jsx
    │   │   ├── AuthModal.jsx
    │   │   ├── Navbar.jsx
    │   │   └── LandingPage.jsx
    │   └── services/
    │       ├── api.js              ← all HTTP calls (fetch-based, no Axios)
    │       ├── useAppStore.js      ← Zustand store (crops, orders, bookings, user)
    │       ├── LanguageContext.jsx ← i18n provider
    │       └── translations.js     ← EN/MR/HI string keys
    └── vite.config.js
```

---

## Route map

| URL | Component | Notes |
|---|---|---|
| `/` | `SectionSelect` | Entry — pick role |
| `/farmer` | `FarmerOverview` | Farmer dashboard with KPIs |
| `/farmer/crops` | `FarmerCrops` | Inventory table with AI risk |
| `/farmer/add-crop` | `FarmerAddCrop` | Crop creation form |
| `/farmer/orders-bookings` | `FarmerOrdersBookings` | Orders + pre-harvest contracts |
| `/buyer` | `BuyerOverview` | Buyer dashboard |
| `/buyer/marketplace` | `BuyerMarketplace` → `Marketplace` | Browse + buy/book |
| `/buyer/orders-contracts` | `BuyerOrdersContracts` → `BuyerPortal` | Orders + contracts |
| `/buyer/ai` | `BuyerAI` → `AIDecisionHub` | AI agents UI |
| `/transporter` | `TransporterOverview` | Transporter dashboard |
| `/transporter/shipments` | `TransporterShipments` → `TransporterPortal` | Shipment management |
| `/transporter/route-optimization` | `TransporterRouteOptimization` → `TransporterPortal` | Route AI |
| `/admin` | `AdminOverview` | Platform KPIs + embedded AdminDashboard |
| `/admin/blockchain` | `AdminBlockchain` → `BlockchainExplorer` | Ledger |
| `/admin/ai` | `AdminAI` → `AIDecisionHub` | AI Hub |
| `/admin/docs` | `AdminDocs` → `AdminDashboard` | Project docs |

---

## Backend API reference

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/login` | none | Login, returns `{ success, token, user }` |
| POST | `/register` | none | Register |
| GET | `/quick-accounts` | none | Demo account list |
| GET | `/me` | `protect` | Current user profile |

### Crops — `/api/crops`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | none | All crops, augmented with AI shelf-life data |
| GET | `/:id` | none | Single crop |
| POST | `/` | `protect` + `farmer/admin` | Create crop → mints blockchain block |
| PATCH | `/:id/status` | `protect` + `farmer/admin` | Update crop status |

### Bookings — `/api/bookings`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | `protect` | All bookings (role-filtered) |
| POST | `/` | `protect` + `buyer/admin` | Create booking |
| POST | `/:id/confirm` | `protect` + `farmer/admin` | Confirm booking |

### Orders — `/api/orders`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | `protect` | All orders (role-filtered) |
| POST | `/instant-buy` | `protect` + `buyer/admin` | Place order |
| PATCH | `/:id/status` | `protect` | Update order status |
| GET | `/transport-optimization` | `protect` | VRP route plan |

### AI — `/api/ai`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/match-crops` | none | Buyer Match Agent |
| GET | `/demand-forecast` | none | Demand Forecast Agent |
| GET | `/wastage-alerts` | none | Wastage Prevention Agent |
| POST | `/optimize-transport` | none | Transport Optimization Agent |
| GET | `/blockchain/ledger` | none | Full blockchain ledger |
| GET | `/admin-dashboard` | `protect` + `admin` | System KPI stats |

---

## Data models (key fields)

### User
- `role`: `farmer | buyer | transporter | admin`
- `farmerProfile`, `buyerProfile`, `transporterProfile` — role-specific sub-objects

### Crop
- `farmerId` (ObjectId) · `farmerName` · `cropName` · `variety` · `category`
- `status`: `pre_harvest | harvested | sold | expired`
- `totalQuantityKg` · `availableQuantityKg` · `pricePerKg` · `qualityGrade`
- `expectedHarvestDate` · `actualHarvestDate` · `estimatedShelfLifeDays`
- `storageCondition`: `ambient | cold_storage | ventilated_dry`
- `location` (village/taluka/district/state/lat/lng)
- AI fields added at query time by `augmentCropWithAI()` — NOT stored:
  `aiShelfLife`, `aiWastageMitigation`, `aiRiskScore`, `isUrgentSale`, `discountPercentage`

### Order
- `orderStatus`: `placed | harvest_ready | transporter_assigned | in_transit | delivered | completed | cancelled`
- `paymentStatus`: `pending | escrow_locked | released_to_farmer | refunded`
- `blockchainTracking.latestTxHash`

### Booking
- `status`: `pending_farmer_approval | confirmed | cancelled | converted_to_order`
- `advancePaymentAmount` = 20% of `totalAmount`

---

## Authentication — current dev state

`NODE_ENV=development` → **auth is bypassed** in `authMiddleware.js`.

- `protect()` and `authorizeRoles()` call `next()` immediately
- A `DEV_USER` fallback is injected as `req.user` with a valid MongoDB ObjectId as `id`
- If a real JWT is sent, it is still verified and used (quick-login flows work)

**To re-enable full auth:** set `NODE_ENV=production` in `backend/.env` and restart.

**DEV_USER:**
```js
{ id: '507f1f77bcf86cd799439011', name: 'Dev User (No Auth)', role: 'admin' }
```

> ⚠️ `DEV_USER.id` must remain a valid 24-char hex ObjectId. If you change it to a
> non-ObjectId string, Mongoose will throw `CastError` when saving crops/orders
> (because `farmerId` / `buyerId` are typed as `ObjectId`) and the route will
> silently fall to the in-memory store instead of MongoDB.

---

## Known issues fixed (do not re-introduce)

### 1. MongoDB database name case mismatch (FIXED)
- **Was:** `MONGODB_URI` ended in `/agriflow` (lowercase)
- **Atlas had:** database named `AgriFlow` (capital A)
- **Error:** `db already exists with different case already have: [AgriFlow] trying to create [agriflow]`
- **Fix:** URI now ends in `/AgriFlow` — must stay this way
- **File:** `backend/.env`

### 2. DEV_USER had non-ObjectId id (FIXED)
- **Was:** `id: 'dev_user_000'`
- **Effect:** `Crop.create()` threw `CastError` on `farmerId` field, caught silently, fell to memoryStore. POST used memory, GET used MongoDB → crop never appeared in list.
- **Fix:** `id: '507f1f77bcf86cd799439011'` (valid ObjectId)
- **File:** `backend/middleware/authMiddleware.js`

### 3. CORS `origin: '*'` + `credentials: true` (FIXED)
- Invalid combination rejected by all browsers when `Authorization` header is sent
- **Fix:** Manual CORS middleware with explicit `allowedOrigins` array, `OPTIONS` handled as first middleware before any route
- **File:** `backend/server.js`

### 4. `Authorization: Bearer null` sent to backend (FIXED)
- `localStorage.getItem('agriflow_token')` returns string `"null"` — truthy in JS
- **Fix:** Guard in `refreshData()` treats `"null"` and `"undefined"` as no token
- **File:** `frontend/src/services/useAppStore.js`

### 5. Silent MongoDB errors in crop POST (FIXED)
- Inner try/catch in `cropRoutes.js` swallowed the real error with `catch {}` (no argument)
- **Fix:** Changed to `catch (mongoErr)` and added `console.error(...)` logging
- **File:** `backend/routes/cropRoutes.js`

---

## Critical invariants — never break these

1. **POST and GET `/api/crops` must use the same data source.** If MongoDB is connected, both must use MongoDB.
2. **After any CREATE/UPDATE/DELETE, call `refreshData()` in the Zustand store** so the UI reflects the real database state.
3. **`DEV_USER.id` must be a valid 24-char hex ObjectId string.**
4. **CORS middleware must be the very first `app.use()` call in `server.js`**, before `express.json()` and before all routes. The `OPTIONS` check must call `res.sendStatus(204)` and return without calling `next()`.
5. **Do not use `origin: '*'` with `credentials: true`** — browsers reject this.
6. **Never silently catch errors in route handlers** — always log with `console.error()`.

---

## Zustand store (`useAppStore.js`) — key actions

| Action | What it does |
|---|---|
| `initApp()` | Cleans stale localStorage tokens, fetches quickAccounts, calls refreshData |
| `refreshData(token?)` | Fetches crops (no auth), orders + bookings (with token) in parallel |
| `loginSuccess(user, token)` | Saves to localStorage, sets currentUser, calls refreshData |
| `logout()` | Clears localStorage, resets currentUser |
| `quickLogin(acc)` | Calls `api.login()`, then `loginSuccess` |

**State shape:** `{ currentUser, currentTab, crops[], orders[], bookings[], quickAccounts[], darkMode, loading, authModalOpen }`

---

## Frontend API client (`api.js`)

All calls go to `http://localhost:5000/api` (hardcoded base URL).
Uses native `fetch` — no Axios.
Token is passed as second argument to calls that need auth:
```js
api.getCrops()                     // no auth
api.createCrop(data, token)        // needs token
api.getOrders(token)               // needs token
api.getBookings(token)             // needs token
```

**Response shapes to know:**
- `GET /api/crops` → `{ success, count, crops[] }`
- `POST /api/crops` → `{ success, crop, blockchainHash }`
- `GET /api/bookings` → `{ success, count, bookings[] }`
- `GET /api/orders` → `{ success, count, orders[] }`
- `POST /api/auth/login` → `{ success, token, user }`

---

## How to run

```powershell
# Terminal 1 — Backend (must start first)
cd backend
node server.js
# Runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# Runs on http://localhost:5173 (or 5174 if busy — both are in CORS allowedOrigins)
```

---

## Debugging checklist — use before writing any code

1. Is the backend running on port 5000? → `Get-NetTCPConnection -LocalPort 5000`
2. Does `GET http://localhost:5000/api/crops` return data? → test with curl/Postman
3. Is MongoDB connected? → check server console for `✅ MongoDB Atlas Connected`
4. After POST, does the `_id` look like a 24-char hex string (MongoDB) or start with `mem_crop_` (memory)?
5. Does `GET /api/crops` return the newly created crop?
6. Does the frontend Zustand store have the updated crops? → check React DevTools
7. Is the component reading from the store correctly?
8. Is `refreshData()` called after the mutation?
9. Check browser console for CORS errors, 401s, 404s, or parse errors.
10. Check server terminal for `[routeName] MongoDB ... failed:` log lines.

---

## Feature completion standard

A feature is **COMPLETE** only when all of these are true:

- [ ] UI works (form submits, button triggers action)
- [ ] API request is correctly formed (method, URL, headers, body)
- [ ] Backend route handles the request
- [ ] MongoDB document is created/updated/deleted
- [ ] Correct response returned to frontend
- [ ] Zustand store updated (`refreshData()` called)
- [ ] UI reflects the new database state
- [ ] Data still present after server restart

"The UI shows a success message" alone is **not** feature complete.

---

*Last updated: October 2026*
