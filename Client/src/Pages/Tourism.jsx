import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCustomer } from '../context/AuthContext';
import { getTourPackages, bookTour } from '../api';
import { MapPin, Clock, Users, Calendar, X, CheckCircle, AlertCircle, Loader2, Search, Tag, Receipt } from 'lucide-react';

function BookingModal({ pkg, customer, onClose, onSuccess }) {
  const [travelDate, setTravelDate] = useState('');
  const [people, setPeople] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = (pkg.basePrice || 0) * people;
  const minDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const handleBook = async () => {
    setError('');
    if (!travelDate) { setError('Please select a travel date.'); return; }
    setLoading(true);
    try {
      await bookTour({
        customer: customer._id,
        package: pkg._id,
        travelDate,
        numberOfPeople: people,
        totalAmount: total,
        currency: pkg.currency || 'USD',
        paymentStatus: 'Unpaid',
        status: 'Pending',
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-8 py-6 flex justify-between items-start bg-blue-600">
          <div>
            <p className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">Tour Booking</p>
            <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
            {pkg.destination && <p className="text-blue-300 text-sm mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{pkg.destination}</p>}
          </div>
          <button onClick={onClose} className="text-blue-300 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-8 space-y-5">
          <div className="bg-slate-50 rounded-xl p-5 border-2 border-slate-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Price per person</span>
              <span className="font-bold text-slate-900">${(pkg.basePrice || 0).toLocaleString()}</span>
            </div>
            {pkg.durationDays && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Duration</span>
                <span className="font-bold text-slate-900">{pkg.durationDays} days</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Travel Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              min={minDate}
              value={travelDate}
              onChange={e => setTravelDate(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-slate-900 bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Number of People</label>
            <div className="flex items-center gap-4">
              <button onClick={() => setPeople(p => Math.max(1, p - 1))} className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:border-primary-500 hover:text-primary-600 bg-white shadow-sm transition-all">-</button>
              <span className="text-2xl font-black text-slate-900 w-8 text-center">{people}</span>
              <button onClick={() => setPeople(p => p + 1)} className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:border-primary-500 hover:text-primary-600 bg-white shadow-sm transition-all">+</button>
            </div>
          </div>

          <div className="bg-primary-50 rounded-xl p-5 border-2 border-primary-100 flex justify-between items-center">
            <span className="font-bold text-slate-900">Total Amount</span>
            <span className="text-2xl font-black text-primary-600">${total.toLocaleString()}</span>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-red-700 text-sm font-bold">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-4 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button onClick={handleBook} disabled={loading} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Booking…</> : <><MapPin className="w-5 h-5" /> Confirm Booking</>}
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 font-medium">Our team will contact you to confirm and arrange payment.</p>
        </div>
      </div>
    </div>
  );
}

export default function Tourism() {
  const { customer } = useCustomer();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Local generated images — each category has its own beautiful image
  const getTourImage = (category = '', name = '') => {
    const cat = (category + ' ' + name).toLowerCase();

    // 🕌 Religious / Hajj / Umrah
    if (cat.includes('religious') || cat.includes('hajj') || cat.includes('umrah') || cat.includes('pilgrimage') || cat.includes('islam') || cat.includes('mecca'))
      return '/images/tour_religious.jpg';

    // 🦁 Adventure / Safari
    if (cat.includes('adventure') || cat.includes('safari') || cat.includes('hiking') || cat.includes('trekking') || cat.includes('outdoor') || cat.includes('mountain'))
      return '/images/tour_adventure.jpg';

    // 🏖️ Leisure / Beach / Tropical
    if (cat.includes('leisure') || cat.includes('beach') || cat.includes('tropical') || cat.includes('resort') || cat.includes('island') || cat.includes('maldives') || cat.includes('relax'))
      return '/images/tour_leisure.jpg';

    // 🏛️ Culture / Historic
    if (cat.includes('cultur') || cat.includes('historic') || cat.includes('heritage') || cat.includes('ancient') || cat.includes('monument') || cat.includes('museum'))
      return '/images/tour_historic.jpg';

    // 🌍 Default
    return '/images/tour_tropical.jpg';
  };

  useEffect(() => {
    getTourPackages()
      .then(setPackages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = packages.filter(p =>
    [p.name, p.destination, p.description].some(v =>
      (v || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleSuccess = () => {
    setSelected(null);
    navigate('/my-invoices');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <div className="pt-20">
        {/* Page header — elite blue */}
        <div className="relative py-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1e3a8a 50%, #1d4ed8 100%)' }}>
          <img
            src="https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=1800&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          <div className="container mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 text-blue-200 border border-blue-400/40 rounded-full px-4 py-2 text-sm font-semibold mb-5 backdrop-blur-sm">
              <MapPin className="w-4 h-4" />
              Tour Packages
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
              Explore Our <span className="text-blue-300">Tour Packages</span>
            </h1>
            <p className="text-blue-200 text-lg font-medium max-w-xl">Handpicked holiday packages to the world's most beautiful destinations.</p>
          </div>
        </div>

        <div className="container mx-auto px-6 py-10">
          {successMsg && (
            <div className="mb-8 p-5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-emerald-700 font-semibold">{successMsg}</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <Link
                      to="/my-invoices"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
                    >
                      <Receipt className="w-4 h-4" /> View My Invoices
                    </Link>
                    <button
                      onClick={() => setSuccessMsg('')}
                      className="inline-flex items-center gap-2 px-4 py-2 border-2 border-emerald-300 text-emerald-700 text-sm font-bold rounded-xl hover:bg-emerald-100 transition-colors"
                    >
                      Continue Browsing
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="relative mb-8 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by destination or package name..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 shadow-sm font-medium text-slate-900"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 animate-pulse h-72">
                  <div className="h-32 bg-slate-200 rounded-t-2xl" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-xl font-bold mb-2">No packages found</p>
              <p className="text-sm font-medium">New packages are added regularly. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((pkg, index) => (
                <div key={pkg._id} className="bg-white rounded-3xl shadow-md border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden group flex flex-col">
                  {/* Card image */}
                  <div className="relative overflow-hidden min-h-[200px] flex flex-col justify-end">
                    <img
                      src={getTourImage(pkg.category, pkg.name)}
                      alt={pkg.name}
                      onError={e => { e.target.onerror = null; e.target.src = '/images/tour_tropical.jpg'; }}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Light overlay — image stays vivid */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/25 to-transparent" />
                    <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg group-hover:scale-110 group-hover:bg-blue-600 group-hover:border-blue-400 transition-all duration-300" style={{ background: 'rgba(255,255,255,0.15)' }}>
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        {pkg.category && (
                          <p className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border backdrop-blur-sm" style={{ background: 'rgba(59,130,246,0.25)', borderColor: 'rgba(147,197,253,0.5)', color: '#bfdbfe' }}>{pkg.category}</p>
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-black text-2xl drop-shadow-md leading-tight">{pkg.name}</h3>
                        {pkg.destination && (
                          <p className="text-blue-200 text-sm mt-1 flex items-center gap-1 font-medium drop-shadow">
                            <MapPin className="w-4 h-4 text-blue-300" />{pkg.destination}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4 flex-1 flex flex-col">
                    {pkg.description && (
                      <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-2 flex-1">{pkg.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {pkg.durationDays && (
                        <span className="text-xs bg-primary-50 text-primary-600 font-bold px-3 py-1.5 rounded-md border border-primary-100 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{pkg.durationDays} Days
                        </span>
                      )}
                      {pkg.maxPeople && (
                        <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1.5 rounded-md border border-slate-200 flex items-center gap-1">
                          <Users className="w-3 h-3" />Max {pkg.maxPeople}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Per person</p>
                        <p className="text-2xl font-black text-slate-900">${(pkg.basePrice || 0).toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => setSelected(pkg)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl transition-all shadow-sm hover:-translate-y-0.5"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />

      {selected && (
        <BookingModal
          pkg={selected}
          customer={customer}
          onClose={() => setSelected(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
