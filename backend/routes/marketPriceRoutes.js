/**
 * GET /api/market-prices
 *
 * Proxy endpoint for the official data.gov.in Mandi commodity price API.
 * Resource ID: 9ef84268-d588-465a-a308-a864a43d0070
 *
 * The API key is read from process.env.DATA_GOV_API_KEY and is NEVER
 * forwarded to the frontend.
 *
 * Supported query params (all optional):
 *   state      – filter by state name        (default: Maharashtra)
 *   district   – filter by district name
 *   market     – filter by mandi/market name
 *   commodity  – filter by commodity name
 *   limit      – number of records            (default: 20, max: 100)
 *   offset     – pagination offset            (default: 0)
 *
 * Normalized response:
 *   { success: true, count: N, total: N, data: [ { ...fields } ] }
 *
 * Prices from the upstream API arrive as strings (₹/quintal).
 * They are parsed to numbers and divided by 100 to give ₹/kg for display.
 */

import express from 'express';

const router = express.Router();

const DATA_GOV_BASE = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const TIMEOUT_MS    = 10000;   // 10 s — upstream can be slow
const MAX_LIMIT     = 100;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Convert a price string coming from data.gov.in to a ₹/kg number.
 * The API returns prices in ₹/quintal (100 kg), so divide by 100.
 * Returns null when the value is missing or unparseable.
 */
const toRupeePerKg = (raw) => {
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  return isNaN(n) ? null : Math.round((n / 100) * 100) / 100; // 2 dp, ₹/kg
};

/**
 * Normalize a single record from the upstream API response into the shape
 * the frontend expects.  Field names confirmed from live API samples:
 *   state, district, market, commodity, variety,
 *   arrival_date, min_price, max_price, modal_price
 */
const normalizeRecord = (rec) => ({
  state:       rec.state       || '',
  district:    rec.district    || '',
  market:      rec.market      || '',
  commodity:   rec.commodity   || '',
  variety:     rec.variety     || '',
  arrivalDate: rec.arrival_date || '',
  // Prices in ₹/kg (converted from ₹/quintal)
  minPrice:    toRupeePerKg(rec.min_price),
  maxPrice:    toRupeePerKg(rec.max_price),
  modalPrice:  toRupeePerKg(rec.modal_price),
  // Keep raw quintal prices as well for reference
  minPricePerQuintal:   Number(rec.min_price)   || null,
  maxPricePerQuintal:   Number(rec.max_price)   || null,
  modalPricePerQuintal: Number(rec.modal_price) || null,
});

// ─── Route handler ────────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  // 1. Check API key is configured
  const apiKey = process.env.DATA_GOV_API_KEY;
  if (!apiKey || apiKey === 'your_data_gov_in_api_key_here') {
    return res.status(503).json({
      success: false,
      message: 'Market price service not configured. Set DATA_GOV_API_KEY in backend/.env.',
      configError: true,
    });
  }

  // 2. Validate and extract query params
  const state     = (req.query.state     || 'Maharashtra').trim();
  const district  = (req.query.district  || '').trim();
  const market    = (req.query.market    || '').trim();
  const commodity = (req.query.commodity || '').trim();
  const limit     = Math.min(parseInt(req.query.limit,  10) || 20, MAX_LIMIT);
  const offset    = Math.max(parseInt(req.query.offset, 10) || 0,  0);

  // 3. Build upstream URL
  //    Filters use the bracket notation: filters[field]=value
  const params = new URLSearchParams({
    'api-key': apiKey,
    format:    'json',
    limit:     String(limit),
    offset:    String(offset),
  });

  // Append filter params — URLSearchParams doesn't percent-encode brackets
  // properly for this API, so we build them manually.
  const filterParts = [];
  if (state)     filterParts.push(`filters%5Bstate%5D=${encodeURIComponent(state)}`);
  if (district)  filterParts.push(`filters%5Bdistrict%5D=${encodeURIComponent(district)}`);
  if (market)    filterParts.push(`filters%5Bmarket%5D=${encodeURIComponent(market)}`);
  if (commodity) filterParts.push(`filters%5Bcommodity%5D=${encodeURIComponent(commodity)}`);

  const upstreamUrl =
    `${DATA_GOV_BASE}?${params.toString()}${filterParts.length ? '&' + filterParts.join('&') : ''}`;

  // 4. Call upstream with timeout
  let upstreamRes;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    upstreamRes = await fetch(upstreamUrl, { signal: controller.signal });
    clearTimeout(timer);
  } catch (fetchErr) {
    const isTimeout = fetchErr.name === 'AbortError';
    console.error('[marketPriceRoutes] Upstream fetch failed:', fetchErr.message);
    return res.status(502).json({
      success: false,
      message: isTimeout
        ? 'Market price API timed out. Please try again.'
        : 'Failed to reach market price service. Check your internet connection.',
    });
  }

  // 5. Parse upstream response
  let upstreamBody;
  try {
    upstreamBody = await upstreamRes.json();
  } catch {
    console.error('[marketPriceRoutes] Failed to parse upstream JSON, status:', upstreamRes.status);
    return res.status(502).json({
      success: false,
      message: `Market price API returned an unexpected response (HTTP ${upstreamRes.status}).`,
    });
  }

  // 6. Handle upstream error codes
  if (!upstreamRes.ok) {
    console.error('[marketPriceRoutes] Upstream error:', upstreamRes.status, upstreamBody?.message);
    // 401/403 usually means an invalid or expired API key
    if (upstreamRes.status === 401 || upstreamRes.status === 403) {
      return res.status(503).json({
        success: false,
        message: 'Market price API key is invalid or expired. Update DATA_GOV_API_KEY in backend/.env.',
        configError: true,
      });
    }
    return res.status(502).json({
      success: false,
      message: `Market price API error (${upstreamRes.status}).`,
    });
  }

  // 7. Normalize records
  // data.gov.in wraps results in { records: [...], total: N, count: N }
  const records = Array.isArray(upstreamBody.records) ? upstreamBody.records : [];
  const normalized = records.map(normalizeRecord);

  // 8. Return clean response (API key never included)
  return res.json({
    success: true,
    count:   normalized.length,
    total:   upstreamBody.total  || normalized.length,
    offset:  upstreamBody.offset || offset,
    filters: { state, district, market, commodity },
    data:    normalized,
  });
});

export default router;
