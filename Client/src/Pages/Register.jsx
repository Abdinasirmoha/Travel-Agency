import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/AuthContext';
import { clientRegister } from '../api';
import { User, Mail, CreditCard, Globe2, Phone, CheckCircle, AlertCircle, Globe, Loader2 } from 'lucide-react';

export default function Register() {
  const { login } = useCustomer();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', passportNo: '', nationality: '', contact: '', gender: 'Male',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const customer = await clientRegister(formData);
      login(customer);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'John Doe' },
    { name: 'email', label: 'Email Address', type: 'email', icon: Mail, placeholder: 'you@example.com' },
    { name: 'passportNo', label: 'Passport Number', type: 'text', icon: CreditCard, placeholder: 'A12345678' },
    { name: 'nationality', label: 'Nationality', type: 'text', icon: Globe2, placeholder: 'Somali' },
    { name: 'contact', label: 'Contact Phone', type: 'tel', icon: Phone, placeholder: '+252 61 234 5678' },
  ];

  return (
    <div className="min-h-screen flex bg-white">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <Link to="/" className="flex items-center gap-2 text-3xl font-bold text-navy-900 hover:opacity-80 transition-opacity">
              <Globe className="w-8 h-8 text-gold-500" />
              EliteTravel
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <h1 className="text-3xl font-bold text-navy-900 mb-2">Create Account</h1>
            <p className="text-slate-500 mb-8 text-sm">Fill in your details to get started — it only takes a minute.</p>

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-emerald-700 font-medium text-sm">Account created! Redirecting to login…</p>
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-red-700 font-medium text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {fields.map(({ name, label, type, icon: Icon, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {label} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type={type}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Gender <span className="text-red-500">*</span></label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating Account…</> : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
