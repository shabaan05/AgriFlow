import { 
  LogIn, 
  UserPlus, 
  X, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  Truck, 
  Briefcase 
} from 'lucide-react';
import { useTranslation } from '../services/LanguageContext';
import { api as defaultApi } from '../services/api';

export const AuthModal = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login', 
  onAuthSuccess, 
  quickAccounts, 
  onQuickLogin, 
  api, 
  t 
}) => {
  if (!isOpen) return null;

  const { t: contextT } = useTranslation();
  const tr = (key, fallback = '') => {
    if (typeof t === 'function') return t(key, fallback);
    if (t && typeof t === 'object' && t[key]) return t[key];
    if (typeof contextT === 'function') return contextT(key, fallback);
    return fallback || key;
  };
  const activeApi = api || defaultApi;

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'farmer',
    phone: '',
    city: 'Kolhapur',
    farmSizeAcres: 5,
    businessType: 'Produce Wholesale',
    vehicleType: '10T Cold Reefer Truck'
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await activeApi.login(loginEmail, loginPassword);
      if (res.success) {
        setSuccessMsg('Successfully logged in!');
        if (onAuthSuccess) onAuthSuccess(res.user, res.token);
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMsg(res.message || 'Invalid credentials.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await activeApi.register(regData);
      if (res.success) {
        setSuccessMsg('Account registered successfully! Redirecting...');
        if (onAuthSuccess) onAuthSuccess(res.user, res.token);
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMsg(res.message || 'Registration failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden text-slate-900">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            {mode === 'login' ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {mode === 'login' ? tr('authModalTitleLogin', 'Sign in to AgriFlow') : tr('authModalTitleReg', 'Create your Account')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login' ? tr('authModalSubLogin', 'Access decentralized agricultural trading platform.') : tr('authModalSubReg', 'Join as Farmer, Buyer, or Logistics Transporter.')}
          </p>
        </div>

        {/* Toggle Mode Tab */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'login' ? 'bg-white text-emerald-700 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            {tr('signIn', 'Sign In')}
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'register' ? 'bg-white text-emerald-700 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            {tr('register', 'Register')}
          </button>
        </div>

        {/* Alert Notifications */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">{tr('emailLabel', 'Email Address')}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="farmer.patil@agriflow.ai"
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">{tr('passwordLabel', 'Password')}</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 text-sm"
            >
              {loading ? 'Authenticating...' : tr('loginBtn', 'Sign In to Workspace')}
            </button>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1">{tr('fullNameLabel', 'Full Name')}</label>
              <input
                type="text"
                value={regData.name}
                onChange={e => setRegData({ ...regData, name: e.target.value })}
                placeholder="Ramesh Patil"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{tr('emailLabel', 'Email Address')}</label>
              <input
                type="email"
                value={regData.email}
                onChange={e => setRegData({ ...regData, email: e.target.value })}
                placeholder="ramesh@agriflow.ai"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{tr('passwordLabel', 'Password')}</label>
              <input
                type="password"
                value={regData.password}
                onChange={e => setRegData({ ...regData, password: e.target.value })}
                placeholder="Min 6 characters"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{tr('roleLabel', 'Role')}</label>
                <select
                  value={regData.role}
                  onChange={e => setRegData({ ...regData, role: e.target.value })}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-900"
                >
                  <option value="farmer">Farmer Producer</option>
                  <option value="buyer">Wholesale Buyer</option>
                  <option value="transporter">Cold Logistics</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{tr('cityLabel', 'City')}</label>
                <input
                  type="text"
                  value={regData.city}
                  onChange={e => setRegData({ ...regData, city: e.target.value })}
                  placeholder="Kolhapur"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">{tr('phoneLabel', 'Phone Number')}</label>
              <input
                type="tel"
                value={regData.phone}
                onChange={e => setRegData({ ...regData, phone: e.target.value })}
                placeholder="+91 98220 11223"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50 text-sm mt-2"
            >
              {loading ? 'Creating Account...' : tr('registerBtn', 'Create Account & Proceed')}
            </button>
          </form>
        )}

        {/* 1-Click Fast Accounts */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
            {tr('orQuickLogin', 'Or 1-Click Demo Login')}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {quickAccounts?.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => {
                  if (onQuickLogin) onQuickLogin(acc);
                  onClose();
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-colors cursor-pointer group"
              >
                <div className="font-bold text-slate-800 group-hover:text-emerald-700 capitalize flex items-center justify-between">
                  {acc.role}
                  <UserCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{acc.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
