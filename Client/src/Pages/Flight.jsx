import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCustomer } from '../context/AuthContext';
import { getFlights, bookTicket } from '../api';
import { Plane, Clock, MapPin, DollarSign, Users, X, CheckCircle, AlertCircle, Loader2, Search, Receipt } from 'lucide-react';

function BookingModal({ flight, customer, onClose, onSuccess }) {
  const [passengers, setPassengers] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = (flight.price || 0) * passengers;

  const handleBook = async () => {
    setError('');
    setLoading(true);
    try {
      await bookTicket({
        customer: customer._id,
        flightDetails: flight._id,
        price: total,
        profit: 0,
        discount: 0,
        totalAmount: total,
        currency: flight.currency || 'USD',
        paymentStatus: 'Unpaid',
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
            <p className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">Flight Booking</p>
            <h3 className="text-xl font-bold text-white">{flight.airline}</h3>
            <p className="text-blue-300 text-sm mt-1">Flight #{flight.flightNumber}</p>
          </div>
          <button onClick={onClose} className="text-blue-300 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-8 space-y-6">
          <div className="bg-slate-50 rounded-xl p-5 border-2 border-slate-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Route</span>
              <span className="font-bold text-slate-900">{flight.origin} → {flight.destination}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Departure</span>
              <span className="font-bold text-slate-900">{flight.departureTime ? new Date(flight.departureTime).toLocaleString() : 'TBC'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Price per person</span>
              <span className="font-bold text-blue-700">${(flight.price || 0).toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Passengers</label>
            <div className="flex items-center gap-4">
              <button onClick={() => setPassengers(p => Math.max(1, p - 1))} className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:border-primary-500 hover:text-primary-600 transition-all">-</button>
              <span className="text-2xl font-bold text-slate-900 w-8 text-center">{passengers}</span>
              <button onClick={() => setPassengers(p => p + 1)} className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center font-bold text-slate-600 hover:border-primary-500 hover:text-primary-600 transition-all">+</button>
            </div>
          </div>

          <div className="rounded-xl p-5 border flex justify-between items-center" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
            <span className="font-bold text-slate-900">Total Amount</span>
            <span className="text-2xl font-bold text-blue-700">${total.toLocaleString()}</span>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <button onClick={handleBook} disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Booking…</> : <><Plane className="w-5 h-5" /> Confirm Booking</>}
          </button>
          <p className="text-center text-xs text-slate-400">Our team will contact you to confirm payment details.</p>
        </div>
      </div>
    </div>
  );
}

export default function Flight() {
  const { customer } = useCustomer();
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const flightImages = [
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1569629743817-70d8db6c323b?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559628233-100c798642d7?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1483450388369-9ed95738483c?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=900&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=900&auto=format&fit=crop',
  ];

  useEffect(() => {
    getFlights()
      .then(setFlights)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = flights.filter(f =>
    [f.airline, f.flightNumber, f.origin, f.destination].some(v =>
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
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1800&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          <div className="container mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 text-blue-200 border border-blue-400/40 rounded-full px-4 py-2 text-sm font-semibold mb-5 backdrop-blur-sm">
              <Plane className="w-4 h-4" />
              Available Flights
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
              Browse &amp; Book{' '}
              <span className="text-blue-300">Flights</span>
            </h1>
            <p className="text-blue-200 text-lg font-medium max-w-xl">Find the best routes across our airline network. Book instantly, fly confidently.</p>
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

          {/* Search */}
          <div className="relative mb-8 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by airline, flight number, origin or destination..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 shadow-sm"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border-2 border-slate-100 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-2/3 mb-4" />
                  <div className="h-6 bg-slate-200 rounded w-1/2 mb-3" />
                  <div className="h-4 bg-slate-100 rounded w-full mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-6" />
                  <div className="h-12 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <Plane className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-xl font-bold mb-2">No flights found</p>
              <p className="text-sm">Try a different search term or check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((flight, index) => (
                <div key={flight._id} className="bg-white rounded-3xl shadow-md border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden group">
                  {/* Card image — real photo, lightly darkened so it stays clear */}
                  <div className="relative overflow-hidden min-h-[220px] flex flex-col justify-end">
                    <img
                      src={flightImages[index % flightImages.length]}
                      alt={`${flight.origin} to ${flight.destination}`}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=900&auto=format&fit=crop'; }}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Light overlay — keeps image vivid */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/25 to-transparent" />
                    <div className="relative z-10 p-6">
                      <div className="flex justify-between items-start mb-5">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg inline-block mb-2 backdrop-blur-sm border" style={{ background: 'rgba(59,130,246,0.25)', borderColor: 'rgba(147,197,253,0.5)', color: '#bfdbfe' }}>{flight.airline}</p>
                          <p className="text-white font-black text-2xl drop-shadow-md">#{flight.flightNumber}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg group-hover:scale-110 group-hover:bg-blue-600 group-hover:border-blue-400 text-white transition-all duration-300" style={{ background: 'rgba(255,255,255,0.15)' }}>
                          <Plane className="w-5 h-5 rotate-45" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-left w-1/3">
                          <p className="text-white font-black text-3xl drop-shadow-md">{flight.origin || '---'}</p>
                          <p className="text-blue-200 text-xs mt-1 uppercase tracking-widest font-medium">Origin</p>
                        </div>
                        <div className="flex-1 flex items-center">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent" />
                          <Plane className="w-5 h-5 text-blue-300 mx-2 drop-shadow-md" />
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent" />
                        </div>
                        <div className="text-right w-1/3">
                          <p className="text-white font-black text-3xl drop-shadow-md">{flight.destination || '---'}</p>
                          <p className="text-blue-200 text-xs mt-1 uppercase tracking-widest font-medium">Dest</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between text-sm text-slate-500 font-medium">
                      {flight.departureTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary-500" />
                          {new Date(flight.departureTime).toLocaleString()}
                        </div>
                      )}
                      {flight.type && (
                        <div className="px-2 py-1 bg-slate-100 rounded-md text-xs font-bold text-slate-600 tracking-wide uppercase">
                          {flight.type}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <Users className="w-4 h-4 text-primary-500" />
                      <span className={flight.seatsAvailable > 5 ? "text-emerald-600 font-bold" : "text-amber-500 font-bold"}>
                        {flight.seatsAvailable || 0}
                      </span> 
                      <span className="text-slate-400">/ {flight.totalSeats || 0} Seats Available</span>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Price per person</p>
                        <p className="text-3xl font-black text-slate-900">${(flight.price || 0).toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => setSelected(flight)}
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
          flight={selected}
          customer={customer}
          onClose={() => setSelected(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
