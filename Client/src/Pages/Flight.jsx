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
        <div className="bg-primary-600 px-8 py-6 flex justify-between items-start">
          <div>
            <p className="text-primary-100 text-xs font-bold uppercase tracking-wider mb-1">Flight Booking</p>
            <h3 className="text-xl font-bold text-white">{flight.airline}</h3>
            <p className="text-primary-100 text-sm mt-1">Flight #{flight.flightNumber}</p>
          </div>
          <button onClick={onClose} className="text-primary-200 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
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
              <span className="font-bold text-primary-600">${(flight.price || 0).toLocaleString()}</span>
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

          <div className="bg-primary-50 rounded-xl p-5 border-2 border-primary-100 flex justify-between items-center">
            <span className="font-bold text-slate-900">Total Amount</span>
            <span className="text-2xl font-bold text-primary-600">${total.toLocaleString()}</span>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <button onClick={handleBook} disabled={loading} className="w-full py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
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
    '/images/flight_mountains.jpg',
    '/images/flight_ocean.jpg',
    '/images/flight_sunset.jpg'
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
        {/* Page header */}
        <div className="bg-primary-600 py-16 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="container mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white border border-white/30 rounded-full px-4 py-2 text-sm font-semibold mb-4 backdrop-blur-sm">
              <Plane className="w-4 h-4" />
              Available Flights
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Browse & Book Flights</h1>
            <p className="text-primary-100 text-lg font-medium">Find the best routes across our airline network. Book in seconds.</p>
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
                <div key={flight._id} className="bg-white rounded-2xl shadow-sm border-2 border-slate-100 hover:border-primary-200 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group">
                  <div className="relative p-6 overflow-hidden min-h-[220px] flex flex-col justify-end">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${flightImages[index % flightImages.length]}')` }} />
                    <div className="absolute inset-0 bg-slate-900/60 group-hover:bg-slate-900/40 transition-colors duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-white text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1.5 rounded-lg inline-block mb-2 border border-white/30 backdrop-blur-sm shadow-sm">{flight.airline}</p>
                          <p className="text-white font-black text-2xl drop-shadow-md">#{flight.flightNumber}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg group-hover:scale-110 group-hover:bg-primary-600 group-hover:border-primary-500 group-hover:text-white text-white transition-all duration-300">
                          <Plane className="w-6 h-6 rotate-45" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-left w-1/3">
                          <p className="text-white font-black text-3xl drop-shadow-md">{flight.origin || '---'}</p>
                          <p className="text-slate-300 text-xs mt-1 uppercase tracking-widest font-medium">Origin</p>
                        </div>
                        <div className="flex-1 flex items-center opacity-80 group-hover:opacity-100 transition-opacity">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                          <Plane className="w-5 h-5 text-white mx-2 drop-shadow-md" />
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                        </div>
                        <div className="text-right w-1/3">
                          <p className="text-white font-black text-3xl drop-shadow-md">{flight.destination || '---'}</p>
                          <p className="text-slate-300 text-xs mt-1 uppercase tracking-widest font-medium">Dest</p>
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
                        className="px-6 py-3 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition-all shadow-md shadow-primary-600/20 hover:shadow-lg hover:-translate-y-0.5"
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
