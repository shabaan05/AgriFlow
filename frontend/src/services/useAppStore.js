import { create } from 'zustand';
import { api } from './api';

export const useAppStore = create((set, get) => ({
  // Theme state with localStorage persistence
  darkMode: (() => {
    const saved = localStorage.getItem('agriflow_theme');
    return saved ? saved === 'dark' : false;
  })(),
  toggleDarkMode: () => {
    set((state) => {
      const next = !state.darkMode;
      localStorage.setItem('agriflow_theme', next ? 'dark' : 'light');
      return { darkMode: next };
    });
  },

  // Auth & Session state
  currentUser: (() => {
    const savedUser = localStorage.getItem('agriflow_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  })(),
  currentTab: 'home',
  quickAccounts: [],

  // Auth modal state
  authModalOpen: false,
  authModalMode: 'login', // 'login' | 'register'
  openAuthModal: (mode = 'login') => set({ authModalOpen: true, authModalMode: mode }),
  closeAuthModal: () => set({ authModalOpen: false }),

  // Data states
  crops: [],
  orders: [],
  bookings: [],
  loading: false,

  // Navigation setter
  setCurrentTab: (tab) => set({ currentTab: tab }),

  // Set current user & auto-route to respective role dashboard
  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem('agriflow_user', JSON.stringify(user));
      let roleTab = 'home';
      if (user.role === 'farmer') roleTab = 'farmer-portal';
      else if (user.role === 'buyer') roleTab = 'buyer-portal';
      else if (user.role === 'transporter') roleTab = 'transporter-portal';
      else if (user.role === 'admin') roleTab = 'admin';
      set({ currentUser: user, currentTab: roleTab });
    } else {
      localStorage.removeItem('agriflow_user');
      localStorage.removeItem('agriflow_token');
      set({ currentUser: null, currentTab: 'home' });
    }
  },

  // Auth actions
  loginSuccess: (user, token) => {
    if (token) localStorage.setItem('agriflow_token', token);
    if (user)  localStorage.setItem('agriflow_user', JSON.stringify(user));

    let targetTab = 'marketplace';
    if (user.role === 'farmer')      targetTab = 'farmer-portal';
    else if (user.role === 'buyer')  targetTab = 'buyer-portal';
    else if (user.role === 'transporter') targetTab = 'transporter-portal';
    else if (user.role === 'admin')  targetTab = 'admin';

    set({ 
      currentUser: user, 
      currentTab: targetTab, 
      authModalOpen: false 
    });

    get().refreshData(token);
  },

  logout: () => {
    localStorage.removeItem('agriflow_token');
    localStorage.removeItem('agriflow_user');
    set({ currentUser: null, currentTab: 'home' });
  },

  quickLogin: async (acc) => {
    try {
      const res = await api.login(acc.email, acc.pass);
      if (res.success) {
        get().loginSuccess(res.user, res.token);
      }
    } catch (err) {
      console.error('Quick login failed:', err);
    }
  },

  // Data fetching
  initApp: async () => {
    // Clean up any stale "null" / "undefined" string tokens written by previous bugs
    const storedToken = localStorage.getItem('agriflow_token');
    if (storedToken === 'null' || storedToken === 'undefined') {
      localStorage.removeItem('agriflow_token');
    }
    const storedUser = localStorage.getItem('agriflow_user');
    if (storedUser === 'null' || storedUser === 'undefined') {
      localStorage.removeItem('agriflow_user');
    }

    try {
      const accRes = await api.getQuickAccounts();
      if (accRes.success) {
        set({ quickAccounts: accRes.accounts });
      }
    } catch (err) {
      console.error('Failed to initialize accounts:', err);
    }
    get().refreshData();
  },

  refreshData: async (tokenOverride) => {
    set({ loading: true });
    // Guard: treat the literal string "null" (from localStorage storing null) as no token
    const rawToken = tokenOverride || localStorage.getItem('agriflow_token');
    const token = rawToken && rawToken !== 'null' && rawToken !== 'undefined' ? rawToken : null;
    try {
      const [cropsRes, ordersRes, bookingsRes] = await Promise.all([
        api.getCrops().catch(() => ({ crops: [] })),
        api.getOrders(token).catch(() => ({ orders: [] })),
        api.getBookings(token).catch(() => ({ bookings: [] }))
      ]);

      set({
        crops: cropsRes.crops || [],
        orders: ordersRes.orders || [],
        bookings: bookingsRes.bookings || []
      });
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      set({ loading: false });
    }
  }
}));
