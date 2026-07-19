import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCustomer } from '../context/AuthContext';
import { getVisaTypes, applyVisa } from '../api';
import { FileText, Globe2, DollarSign, X, CheckCircle, AlertCircle, Loader2, Search, Receipt } from 'lucide-react';

function ApplyModal({ visaType, customer, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    setError('');
    setLoading(true);
    try {
      await applyVisa({
        customer: customer._id,
        visaType: visaType._id,
        totalAmount: visaType.basePrice || 0,
        currency: 'USD',
        paymentStatus: 'Unpaid',
        status: 'Pending',
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Application failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-8 py-6 flex justify-between items-start bg-blue-600">
          <div>
            <p className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">Visa Application</p>
            <h3 className="text-xl font-bold text-white">{visaType.name}</h3>
            {visaType.country && <p className="text-blue-300 text-sm mt-1">{visaType.country}</p>}
          </div>
          <button onClick={onClose} className="text-blue-300 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-8 space-y-6">
          {visaType.description && (
            <div className="bg-slate-50 rounded-xl p-5 border-2 border-slate-100">
              <p className="text-sm text-slate-600 leading-relaxed">{visaType.description}</p>
            </div>
          )}

          <div className="bg-primary-50 rounded-xl p-5 border-2 border-primary-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Processing Fee</span>
              <span className="font-bold text-slate-900 text-lg">${(visaType.basePrice || 0).toLocaleString()}</span>
            </div>
            {visaType.processingDays && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Processing Time</span>
                <span className="font-bold text-slate-900">{visaType.processingDays} days</span>
              </div>
            )}
          </div>

          <div className="bg-slate-50 border-2 border-slate-100 rounded-xl p-5 text-sm text-slate-600">
            <p className="font-bold text-slate-900 mb-1">📋 Next Steps</p>
            <p>After submission, our visa team will review your application and contact you at <span className="font-bold text-primary-600">{customer.email}</span> with payment and document requirements.</p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-4 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button onClick={handleApply} disabled={loading} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</> : <><FileText className="w-5 h-5" /> Submit Application</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Visa() {
  const { customer } = useCustomer();
  const navigate = useNavigate();
  const [visaTypes, setVisaTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Smart image matcher — clear, verified Unsplash photos per visa type
  const getVisaImage = (visaName = '') => {
    const name = visaName.toLowerCase();

    // 🎓 Student — beautiful international university students image (local)
    if (name.includes('student') || name.includes('study') || name.includes('education'))
      return '/images/student_visa.jpg';

    // 💼 Work — busy office / workers
    if (name.includes('work') || name.includes('employ') || name.includes('labor') || name.includes('labour'))
      return 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=900&auto=format&fit=crop';

    // 🏥 Medical — hospital / doctor
    if (name.includes('medical') || name.includes('health') || name.includes('treatment'))
      return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=900&auto=format&fit=crop';

    // 👨‍👩‍👧 Family — happy family
    if (name.includes('family') || name.includes('spouse') || name.includes('dependent') || name.includes('reunion'))
      return 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=900&auto=format&fit=crop';

    // 🏖️ Tourist / Holiday — beach/travel
    if (name.includes('tourist') || name.includes('tourism') || name.includes('visit') || name.includes('holiday') || name.includes('vacation'))
      return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=900&auto=format&fit=crop';

    // 🏢 Business — corporate building / meeting
    if (name.includes('business') || name.includes('investor') || name.includes('trade') || name.includes('commerce'))
      return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=900&auto=format&fit=crop';

    // ✈️ Transit — airport
    if (name.includes('transit') || name.includes('stopover') || name.includes('layover'))
      return 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=900&auto=format&fit=crop';

    // 🕌 Religious / Hajj / Umrah — mosque
    if (name.includes('religious') || name.includes('hajj') || name.includes('umrah') || name.includes('pilgrimage'))
      return 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?q=80&w=900&auto=format&fit=crop';

    // 🏛️ Diplomatic / Government
    if (name.includes('diplomatic') || name.includes('official') || name.includes('government'))
      return 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=900&auto=format&fit=crop';

    // 🗼 Asia — Tokyo / Asian city
    if (name.includes('asia') || name.includes('china') || name.includes('japan') || name.includes('korea'))
      return 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=900&auto=format&fit=crop';

    // 🗼 Europe — Paris / European city
    if (name.includes('europe') || name.includes('schengen') || name.includes('uk') || name.includes('france'))
      return 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=900&auto=format&fit=crop';

    // 🏙️ Middle East — Dubai skyline
    if (name.includes('middle east') || name.includes('gulf') || name.includes('uae') || name.includes('saudi'))
      return 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=900&auto=format&fit=crop';

    // 🌍 Default — passport / travel
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=900&auto=format&fit=crop';
  };

  useEffect(() => {
    getVisaTypes()
      .then(setVisaTypes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = visaTypes.filter(v =>
    [v.name, v.country, v.description].some(val =>
      (val || '').toLowerCase().includes(search.toLowerCase())
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
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1800&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          <div className="container mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 text-blue-200 border border-blue-400/40 rounded-full px-4 py-2 text-sm font-semibold mb-5 backdrop-blur-sm">
              <FileText className="w-4 h-4" />
              Visa Services
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
              Apply for Your <span className="text-blue-300">Visa</span>
            </h1>
            <p className="text-blue-200 text-lg font-medium max-w-xl">Fast and hassle-free visa processing for destinations worldwide.</p>
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
              placeholder="Search by country or visa type..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 shadow-sm font-medium"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border-2 border-slate-100 animate-pulse h-52">
                  <div className="h-4 bg-slate-100 rounded w-1/2 mb-3" />
                  <div className="h-6 bg-slate-200 rounded w-2/3 mb-4" />
                  <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <Globe2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-xl font-bold mb-2">No visa types found</p>
              <p className="text-sm font-medium">Please check back later or contact our team directly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((visa) => (
                <div key={visa._id} className="bg-white rounded-3xl shadow-md border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden group">
                  <div className="relative overflow-hidden min-h-[200px] flex flex-col justify-end">
                    <img
                      src={getVisaImage(visa.name)}
                      alt={visa.name}
                      onError={e => {
                        const fallbacks = [
                          '/images/student_visa.jpg',
                          'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=900&auto=format&fit=crop',
                          'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=900&auto=format&fit=crop',
                        ];
                        const current = fallbacks.indexOf(e.target.src);
                        if (current < fallbacks.length - 1) {
                          e.target.src = fallbacks[current + 1];
                        }
                      }}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Light overlay — image stays vivid */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/25 to-transparent" />
                    <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg group-hover:scale-110 group-hover:bg-blue-600 group-hover:border-blue-400 transition-all duration-300" style={{ background: 'rgba(255,255,255,0.15)' }}>
                          <Globe2 className="w-6 h-6 text-white" />
                        </div>
                        {visa.country && (
                          <p className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border backdrop-blur-sm" style={{ background: 'rgba(59,130,246,0.25)', borderColor: 'rgba(147,197,253,0.5)', color: '#bfdbfe' }}>{visa.country}</p>
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-black text-2xl drop-shadow-md leading-tight">{visa.name}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {visa.description && (
                      <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-2">{visa.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {visa.processingDays && (
                        <span className="text-xs bg-primary-50 text-primary-600 font-bold px-3 py-1.5 rounded-md border border-primary-100">
                          ⏱ {visa.processingDays} Days Processing
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Processing Fee</p>
                        <p className="text-2xl font-black text-slate-900">${(visa.basePrice || 0).toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => setSelected(visa)}
                        className="px-6 py-3 text-white text-sm font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl transition-all shadow-sm hover:-translate-y-0.5"
                      >
                        Apply Now
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
        <ApplyModal
          visaType={selected}
          customer={customer}
          onClose={() => setSelected(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
