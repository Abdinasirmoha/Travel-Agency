import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/AuthContext';
import { clientLogin } from '../api';
import { Mail, CreditCard, Globe, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const { login } = useCustomer();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [passportNo, setPassportNo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const customer = await clientLogin(email, passportNo);
      login(customer);
      navigate('/flights');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 text-3xl font-black text-slate-900 mb-10 group">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-md shadow-primary-600/20 group-hover:scale-110 transition-transform">
            <Globe className="w-6 h-6 text-white" />
          </div>
          EliteTravel
        </Link>

        <div className="bg-white rounded-[2rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Sign In</h1>
          <p className="text-slate-500 mb-8 font-medium">Enter your email and passport number to continue.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-red-700 font-bold text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Passport Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  required
                  type="text"
                  value={passportNo}
                  onChange={e => setPassportNo(e.target.value)}
                  placeholder="A12345678"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-slate-400"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">This is your unique identifier used as your password.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 hover:-translate-y-0.5"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing In…</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8 font-medium relative z-10">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-bold hover:text-primary-700 transition-colors">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
