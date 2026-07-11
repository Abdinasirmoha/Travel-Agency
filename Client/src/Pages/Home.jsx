import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Plane, FileText, MapPin, Users, Globe2, Building2, Star, ArrowRight, CheckCircle, ShieldCheck, Search, Calendar, ChevronRight, Quote } from 'lucide-react';

const stats = [
  { number: '500+', label: 'Destinations' },
  { number: '10K+', label: 'Customers Served' },
  { number: '50+', label: 'Airline Partners' },
  { number: '15+', label: 'Years Experience' },
];

const services = [
  {
    icon: Plane,
    title: 'Flight Bookings',
    desc: 'Browse hundreds of routes across 50+ airlines. Get the best fares and book in seconds.',
    link: '/flights',
  },
  {
    icon: FileText,
    title: 'Visa Services',
    desc: 'Fast and hassle-free visa processing for destinations worldwide. We handle the paperwork.',
    link: '/visa',
  },
  {
    icon: MapPin,
    title: 'Tour Packages',
    desc: 'Curated holiday packages to the world\'s most amazing destinations. All-inclusive experiences.',
    link: '/tourism',
  },
];

const features = [
  'Secure online booking 24/7',
  'Best price guarantee',
  'Dedicated customer support',
  'Instant confirmation',
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Frequent Traveler',
    text: 'EliteTravel made my trip to the Maldives absolutely seamless. The flight booking was quick, and the resort they recommended was breathtaking!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop'
  },
  {
    name: 'Michael Chen',
    role: 'Business Consultant',
    text: 'I rely on EliteTravel for all my international business trips. Their visa processing service is incredibly fast and saves me hours of paperwork.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop'
  },
  {
    name: 'Aisha Patel',
    role: 'Family Vacationer',
    text: 'Booking our family tour to Istanbul was a breeze. The dedicated support team answered all our questions and ensured we had the best experience.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop'
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary-100 selection:text-primary-900">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white pt-32 pb-24 md:pt-40 md:pb-32">
        {/* Decorative subtle blur background elements */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary-50/80 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-primary-50/60 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 container mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6 space-y-10">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 rounded-full px-4 py-2 text-sm font-bold shadow-sm border border-primary-100">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              #1 Rated Travel Agency
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Explore The World
              <span className="block text-primary-600 mt-2">
                With EliteTravel
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-xl font-medium">
              Your premium travel partner for flights, visas, and unforgettable holiday packages. 
              Register today and start your journey with ease.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to="/flights" className="flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 hover:-translate-y-1 transition-all shadow-xl shadow-primary-600/20">
                <Plane className="w-5 h-5" />
                Explore Flights
              </Link>
              <Link to="/visa" className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 border-2 border-primary-100 font-bold rounded-2xl hover:bg-primary-50 hover:border-primary-200 transition-all hover:-translate-y-1 shadow-sm">
                <FileText className="w-5 h-5" />
                Apply for Visa
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-6 border-t border-slate-100 max-w-md">
              {features.map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                  <CheckCircle className="w-4 h-4 text-primary-500 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Right side Images Collage */}
          <div className="lg:col-span-6 relative hidden md:block">
            <div className="relative w-full aspect-square">
              {/* Main Image */}
              <div className="absolute top-0 right-0 w-[75%] h-[80%] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white z-10">
                <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop" alt="Airplane flying in the sky" className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" />
              </div>
              
              {/* Secondary Image */}
              <div className="absolute bottom-0 left-0 w-[55%] h-[55%] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white z-20">
                <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop" alt="Beach destination" className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000" />
              </div>

              {/* Floating Badge */}
              <div className="absolute top-1/2 left-[-5%] bg-white rounded-2xl p-5 shadow-2xl z-30 flex items-center gap-4 hover:-translate-y-1 transition-transform">
                 <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center">
                   <Plane className="w-7 h-7 text-primary-600" />
                 </div>
                 <div>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-0.5">Daily Flights</p>
                   <p className="text-2xl font-black text-slate-900">500+</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Airline Partners Slider ── */}
      <section className="py-10 bg-slate-50 border-b border-slate-100 overflow-hidden">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Trusted by 50+ Global Airlines</p>
          <div className="flex justify-center flex-wrap gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             <div className="text-2xl font-black text-slate-800 flex items-center gap-2"><Plane className="w-6 h-6 text-slate-500"/> EMIRATES</div>
             <div className="text-2xl font-black text-slate-800 flex items-center gap-2"><Plane className="w-6 h-6 text-slate-500"/> QATAR</div>
             <div className="text-2xl font-black text-slate-800 flex items-center gap-2"><Plane className="w-6 h-6 text-slate-500"/> TURKISH</div>
             <div className="text-2xl font-black text-slate-800 flex items-center gap-2"><Plane className="w-6 h-6 text-slate-500"/> ETHIOPIAN</div>
             <div className="text-2xl font-black text-slate-800 flex items-center gap-2 hidden md:flex"><Plane className="w-6 h-6 text-slate-500"/> LUFTHANSA</div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-white py-20 relative">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats.map(({ number, label }) => (
            <div key={label} className="text-center group flex flex-col items-center">
              <div className="h-20 flex items-center justify-center">
                <p className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight group-hover:text-primary-600 group-hover:scale-110 transition-all duration-300">{number}</p>
              </div>
              <p className="text-slate-500 mt-4 font-bold text-sm uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ── */}
      <section className="py-24 bg-slate-50 relative border-t border-slate-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-primary-600 font-bold tracking-widest uppercase text-[11px] mb-4 bg-primary-50 px-4 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              Our Services
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">Premium Travel Solutions</h2>
            <p className="text-slate-500 text-lg leading-relaxed">From booking flights to processing visas and curating holiday packages, we cover every step of your journey with premium care.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map(({ icon: Icon, title, desc, link }) => (
              <Link key={title} to={link} className="bg-white rounded-[2rem] p-8 md:p-10 shadow-lg shadow-slate-200/50 border border-slate-100 hover:border-primary-300 hover:shadow-2xl hover:shadow-primary-600/10 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-50 to-transparent rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-700" />
                
                <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-8 group-hover:bg-primary-600 group-hover:shadow-lg group-hover:shadow-primary-600/30 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3">
                  <Icon className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors duration-500" />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{title}</h3>
                <p className="text-slate-500 text-base leading-relaxed mb-8">{desc}</p>
                
                <div className="flex items-center text-primary-600 font-bold text-sm group-hover:gap-3 gap-2 transition-all">
                  Explore Now <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Destinations ── */}
      <section className="py-24 bg-white relative border-t border-slate-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-primary-600 font-bold tracking-widest uppercase text-[11px] mb-4 bg-primary-50 px-4 py-1.5 rounded-full">
              <MapPin className="w-3.5 h-3.5" />
              Top Locations
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">Popular Destinations</h2>
            <p className="text-slate-500 text-lg leading-relaxed">Explore the most loved destinations by our travellers. Book your next adventure with EliteTravel today.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Dubai, UAE',
                image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
                price: '$499',
                days: '5 Days',
              },
              {
                title: 'Istanbul, Turkey',
                image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800&auto=format&fit=crop',
                price: '$599',
                days: '7 Days',
              },
              {
                title: 'Maldives',
                image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop',
                price: '$1,299',
                days: '6 Days',
              }
            ].map((dest) => (
              <div key={dest.title} className="group relative rounded-[2rem] overflow-hidden cursor-pointer shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300 transition-all duration-500">
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  <img src={dest.image} alt={dest.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 p-8 w-full transform transition-transform duration-500">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-2 tracking-tight group-hover:-translate-y-1 transition-transform duration-500">{dest.title}</h3>
                      <div className="flex items-center gap-2 text-white/80 text-sm font-medium group-hover:-translate-y-1 transition-transform duration-500 delay-75">
                        <CheckCircle className="w-4 h-4 text-emerald-400" /> {dest.days} · All Inclusive
                      </div>
                    </div>
                    <div className="text-right group-hover:-translate-y-1 transition-transform duration-500 delay-100">
                      <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">From</p>
                      <p className="text-2xl font-black text-emerald-400">{dest.price}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/2" />
        
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-primary-600 font-bold tracking-widest uppercase text-[11px] mb-4 bg-primary-50 px-4 py-1.5 rounded-full">
              <Quote className="w-3.5 h-3.5" />
              Testimonials
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">What Our Travellers Say</h2>
            <p className="text-slate-500 text-lg leading-relaxed">Don't just take our word for it. Read about the unforgettable experiences of our happy customers.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <div key={idx} className="bg-white rounded-[2rem] p-8 md:p-10 shadow-lg shadow-slate-200/50 border border-slate-100 relative group hover:-translate-y-2 transition-transform duration-500">
                <Quote className="absolute top-8 right-8 w-12 h-12 text-slate-100 group-hover:text-primary-50 transition-colors duration-500" />
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-600 text-base leading-relaxed mb-8 relative z-10 font-medium">"{test.text}"</p>
                <div className="flex items-center gap-4">
                  <img src={test.avatar} alt={test.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" />
                  <div>
                    <h4 className="font-bold text-slate-900">{test.name}</h4>
                    <p className="text-sm font-medium text-slate-500">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-24 bg-white overflow-hidden border-t border-slate-100">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 pr-8">
            <div className="inline-flex items-center gap-2 text-primary-600 font-bold tracking-widest uppercase text-[11px] bg-primary-50 px-4 py-1.5 rounded-full">
              Why EliteTravel
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">Trusted by Thousands of Travellers Worldwide</h2>
            <p className="text-slate-500 leading-relaxed text-lg mb-8">We combine decades of travel expertise with modern technology to give you the smoothest booking experience possible. From visa processing to handpicked tour packages, we are with you every step of the way.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
              {[
                { icon: Globe2, label: '500+ Destinations', desc: 'Worldwide coverage' },
                { icon: Users, label: 'Expert Team', desc: 'Always here to help' },
                { icon: Building2, label: 'Trusted Partners', desc: '50+ airline partners' },
                { icon: Star, label: 'Top Rated', desc: '4.9/5 customer rating' },
              ].map(({ icon: I, label, desc }) => (
                <div key={label} className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-primary-200 hover:shadow-md transition-all group cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-primary-50 flex items-center justify-center shrink-0 transition-colors">
                    <I className="w-6 h-6 text-slate-500 group-hover:text-primary-600 transition-colors" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-base">{label}</p>
                    <p className="text-slate-500 text-sm mt-1 font-medium">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            {/* Soft background shape */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-emerald-50 rounded-[3rem] transform rotate-3 scale-105 -z-10" />
            
            <div className="bg-white border border-slate-200 rounded-[3rem] p-12 shadow-2xl shadow-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <p className="text-primary-600 font-bold mb-6 uppercase tracking-widest text-[11px] flex items-center gap-2">
                <Plane className="w-3.5 h-3.5" /> Register & Book Today
              </p>
              <h3 className="text-3xl font-black text-slate-900 mb-10 tracking-tight">Get Started in 3 Simple Steps</h3>
              
              <div className="space-y-10">
                {[
                  { step: '01', title: 'Create Account', desc: 'Register with your passport number in seconds.' },
                  { step: '02', title: 'Browse Services', desc: 'Explore flights, visas, and tour packages.' },
                  { step: '03', title: 'Book & Confirm', desc: 'Book with one click. Admin confirms & contacts you.' },
                ].map(({ step, title, desc }, idx) => (
                  <div key={step} className="flex gap-6 relative group">
                    {idx !== 2 && <div className="absolute left-7 top-14 bottom-[-2.5rem] w-[2px] bg-slate-100 group-hover:bg-primary-100 transition-colors" />}
                    <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-lg shadow-primary-600/30 z-10 group-hover:scale-110 group-hover:rotate-3 transition-transform">{step}</div>
                    <div className="pt-2">
                      <p className="font-bold text-xl text-slate-900 group-hover:text-primary-600 transition-colors">{title}</p>
                      <p className="text-slate-500 font-medium mt-2 text-base leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
        {/* Dynamic geometric patterns */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=2000&auto=format&fit=crop" 
            alt="Travel background" 
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-500/20 backdrop-blur-md mb-8 border border-primary-400/30">
            <Globe2 className="w-10 h-10 text-primary-400" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">Start Your Journey Today</h2>
          <p className="text-slate-300 max-w-2xl mx-auto mb-12 text-xl font-medium leading-relaxed">
            Create a free account in seconds. No credit card required.
            Browse flights, apply for visas, and book tour packages instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link to="/register" className="px-10 py-5 bg-primary-600 text-white font-black rounded-2xl text-lg hover:bg-primary-500 hover:scale-105 hover:-translate-y-1 transition-all shadow-xl shadow-primary-600/30 flex items-center justify-center gap-2">
              Create Free Account <ChevronRight className="w-5 h-5" />
            </Link>
            <Link to="/about" className="px-10 py-5 bg-white/10 text-white font-bold rounded-2xl text-lg hover:bg-white/20 transition-all border border-white/20 backdrop-blur-md">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
