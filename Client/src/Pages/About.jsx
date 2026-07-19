import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Globe, Users, Award, Heart, Plane, FileText, MapPin,
  Phone, Mail, ArrowRight, ShieldCheck, Star, CheckCircle,
  Clock, Headphones,
} from 'lucide-react';

const stats = [
  { label: 'Destinations',    value: '500+',  icon: Globe },
  { label: 'Happy Travelers', value: '10K+',  icon: Users },
  { label: 'Years Experience',value: '15+',   icon: Award },
  { label: 'Global Rating',   value: '4.9★',  icon: Heart },
];

const values = [
  { icon: ShieldCheck, title: 'Trust & Transparency', desc: 'We are fully transparent with pricing, timelines and every step of your booking.' },
  { icon: Star,        title: 'Excellence First',     desc: 'We partner only with the world\'s top airlines, hotels and tour operators.' },
  { icon: Headphones,  title: '24/7 Support',         desc: 'Our expert travel concierges are available around the clock for you.' },
  { icon: Clock,       title: 'Fast Processing',      desc: 'From visa approvals to flight confirmations — we move quickly so you can too.' },
  { icon: Globe,       title: 'Global Network',       desc: '50+ airline partners, 500+ destinations, and counting — worldwide coverage.' },
  { icon: Heart,       title: 'Personalised Care',    desc: 'Every itinerary is tailor-made because no two journeys are the same.' },
];

const team = [
  { name: 'Alex Sterling',  role: 'CEO & Founder',         image: '/images/team_alex.jpg' },
  { name: 'Sarah Mitchell', role: 'Head of Visa Services',  image: '/images/team_sarah.jpg' },
  { name: 'Omar Hassan',    role: 'Flight Operations Lead',  image: '/images/team_omar.jpg' },
  { name: 'Lisa Chen',      role: 'Customer Success',        image: '/images/team_lisa.jpg' },
];

const services = [
  { icon: Plane,    title: 'Flight Bookings', desc: '50+ airlines, hundreds of routes, best fares guaranteed.', link: '/flights' },
  { icon: FileText, title: 'Visa Services',   desc: 'Fast, hassle-free visa processing for any destination.',   link: '/visa' },
  { icon: MapPin,   title: 'Tour Packages',   desc: 'Curated holidays — religious, adventure, leisure & more.', link: '/tourism' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <div className="pt-20">

        {/* ── Hero ── */}
        <div className="relative overflow-hidden" style={{ minHeight: '520px' }}>
          <img
            src="/images/about_hero.jpg"
            alt="EliteTravel Agency"
            className="absolute inset-0 w-full h-full object-cover"
            onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
          />
          {/* Deep blue overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10,22,40,0.88) 0%, rgba(30,58,138,0.80) 60%, rgba(10,22,40,0.70) 100%)' }} />

          <div className="relative z-10 container mx-auto px-6 py-32 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-blue-400/40 text-blue-200 rounded-full px-5 py-2 text-sm font-bold mb-6 backdrop-blur-sm uppercase tracking-widest">
              <Globe className="w-4 h-4" /> Our Story
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
              Redefining <span className="text-blue-300">Travel Excellence</span>
            </h1>
            <p className="text-blue-100 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-medium">
              For over 15 years, EliteTravel has been connecting people to the world's most extraordinary destinations.
              We are more than a travel agency — we are the architects of your next unforgettable journey.
            </p>
          </div>
        </div>

        {/* ── Floating Stats ── */}
        <div className="container mx-auto px-6 relative z-20 -mt-1">
          <div className="bg-white rounded-3xl border-2 border-blue-100 p-8 md:p-12" style={{ boxShadow: '0 25px 60px -10px rgba(37,99,235,0.18), 0 10px 30px -5px rgba(0,0,0,0.10)' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map(({ label, value, icon: Icon }, i) => (
                <div key={i} className={`text-center group ${i !== 0 ? 'border-l-2 border-blue-100 pl-8' : ''}`}>
                  <div className="w-16 h-16 mx-auto bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-4xl font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">{value}</p>
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Mission Section ── */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 text-blue-600 font-bold tracking-widest uppercase text-xs bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                <ShieldCheck className="w-4 h-4" /> Our Mission
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                Making World Travel <br />
                <span className="text-blue-600">Accessible to Everyone</span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                We believe travel transforms lives. Our mission is to remove every barrier between you and your dream destination — whether it's finding the best flight deals, processing your visa swiftly, or curating an unforgettable holiday package.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-2xl">
                <p className="text-slate-700 italic text-lg font-medium leading-relaxed">
                  "With a dedicated team of passionate travel experts and a network spanning 50+ premium airlines and 500+ exclusive destinations, we deliver world-class experiences at accessible prices."
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                {['Best Price Guarantee', 'Instant Confirmation', 'Secure Booking', '24/7 Support'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-600 font-semibold">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" /> {f}
                  </div>
                ))}
              </div>
              <Link to="/flights" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-md hover:-translate-y-0.5">
                Explore Our Services <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 translate-x-4 translate-y-4 rounded-3xl opacity-15 -z-10" />
              <div className="rounded-3xl overflow-hidden shadow-2xl group">
                <img
                  src="/images/about_mission.jpg"
                  alt="Happy international travelers"
                  className="w-full h-[520px] object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={e => { e.target.onerror = null; e.target.src = '/images/about_hero.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent rounded-3xl" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl p-5 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <Plane className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-bold">Guided by Excellence</h3>
                    </div>
                    <p className="text-white/80 text-sm font-medium">
                      Every journey we plan is crafted with precision, care, and a deep understanding of what makes travel truly magical.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Our Values ── */}
        <section className="py-24 bg-slate-50 border-t border-slate-100">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 text-blue-600 font-bold tracking-widest uppercase text-xs bg-blue-50 px-4 py-2 rounded-full border border-blue-100 mb-4">
                <Star className="w-4 h-4" /> Why Choose Us
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">What Sets Us Apart</h2>
              <p className="text-slate-500 text-lg font-medium">Six core pillars that guide every decision we make for you.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map(({ icon: Icon, title, desc }, i) => (
                <div
                  key={title}
                  className="bg-white rounded-3xl p-8 border-2 border-slate-100 hover:border-blue-300 hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden"
                  style={{ boxShadow: '0 4px 24px rgba(37,99,235,0.07), 0 1.5px 6px rgba(0,0,0,0.06)' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow='0 20px 50px -8px rgba(37,99,235,0.22), 0 8px 20px -4px rgba(0,0,0,0.10)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow='0 4px 24px rgba(37,99,235,0.07), 0 1.5px 6px rgba(0,0,0,0.06)'}
                >
                  {/* Permanent blue top accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 rounded-t-3xl" />
                  {/* Soft glow corner */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300" style={{ boxShadow: '0 8px 20px rgba(37,99,235,0.40)' }}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What We Offer ── */}
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 text-blue-600 font-bold tracking-widest uppercase text-xs bg-blue-50 px-4 py-2 rounded-full border border-blue-100 mb-4">
                <MapPin className="w-4 h-4" /> Our Services
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Everything You Need to Travel</h2>
              <p className="text-slate-500 text-lg font-medium">From takeoff to touchdown — we handle every detail.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map(({ icon: Icon, title, desc, link }) => (
                <Link
                  key={title}
                  to={link}
                  className="relative bg-white rounded-3xl p-10 border-2 border-blue-100 hover:border-blue-400 hover:-translate-y-3 transition-all duration-300 group overflow-hidden flex flex-col"
                  style={{ boxShadow: '0 8px 30px rgba(37,99,235,0.10), 0 2px 8px rgba(0,0,0,0.06)' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow='0 24px 60px -8px rgba(37,99,235,0.28), 0 10px 24px -4px rgba(0,0,0,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow='0 8px 30px rgba(37,99,235,0.10), 0 2px 8px rgba(0,0,0,0.06)'}
                >
                  {/* Solid background on hover */}
                  <div className="absolute inset-0 bg-transparent group-hover:bg-blue-50/50 transition-colors duration-500 rounded-3xl" />
                  <div className="absolute top-0 right-0 w-36 h-36 bg-blue-100 rounded-bl-full opacity-30 group-hover:opacity-70 group-hover:scale-125 transition-all duration-700" />
                  {/* Left accent bar */}
                  <div className="absolute left-0 top-8 bottom-8 w-1.5 bg-blue-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div
                    className="relative w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300"
                    style={{ boxShadow: '0 10px 30px rgba(37,99,235,0.45)' }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="relative text-2xl font-bold text-slate-900 mb-4">{title}</h3>
                  <p className="relative text-slate-500 leading-relaxed mb-8 font-medium flex-1">{desc}</p>
                  <div className="relative flex items-center text-blue-600 font-bold text-sm gap-2 group-hover:gap-4 transition-all border-t-2 border-blue-100 pt-5">
                    Explore Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Team ── */}
        <section className="py-24 bg-slate-50 border-t border-slate-100">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 text-blue-600 font-bold tracking-widest uppercase text-xs bg-blue-50 px-4 py-2 rounded-full border border-blue-100 mb-4">
                <Users className="w-4 h-4" /> Our People
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Meet Our Expert Team</h2>
              <p className="text-slate-500 text-lg font-medium">Passionate travel professionals dedicated to making your journey perfect.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map(({ name, role, image }) => (
                <div
                  key={name}
                  className="bg-white rounded-3xl p-8 text-center border-2 border-blue-100 hover:border-blue-400 hover:-translate-y-3 transition-all duration-300 group relative overflow-hidden"
                  style={{ boxShadow: '0 6px 24px rgba(37,99,235,0.10), 0 2px 6px rgba(0,0,0,0.05)' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow='0 24px 60px -8px rgba(37,99,235,0.30), 0 8px 20px -4px rgba(0,0,0,0.10)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow='0 6px 24px rgba(37,99,235,0.10), 0 2px 6px rgba(0,0,0,0.05)'}
                >
                  {/* Permanent blue top bar */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600 rounded-t-3xl" />
                  {/* Soft background glow */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-blue-50/30 rounded-b-3xl" />
                  <div
                    className="w-28 h-28 rounded-full mx-auto mb-6 overflow-hidden border-4 border-blue-200 group-hover:border-blue-500 transition-all duration-300 group-hover:scale-110"
                    style={{ boxShadow: '0 8px 28px rgba(37,99,235,0.25)' }}
                  >
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-cover object-top"
                      onError={e => { e.target.onerror = null; e.target.src = '/images/about_hero.jpg'; }}
                    />
                  </div>
                  <h3 className="relative font-black text-slate-900 text-xl mb-1">{name}</h3>
                  <p className="relative text-blue-600 font-bold text-sm mb-5">{role}</p>
                  <div className="relative w-16 h-0.5 bg-blue-200 mx-auto rounded-full group-hover:w-24 group-hover:bg-blue-400 transition-all duration-300" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="py-24 bg-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img src="/images/about_hero.jpg" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full border border-white/20 mb-8 backdrop-blur-sm">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Have Questions? Get In Touch
            </h2>
            <p className="text-blue-100 text-lg mb-12 max-w-2xl mx-auto font-medium">
              Our global team of travel concierges is available 24/7 to help you plan your perfect itinerary.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a href="mailto:support@elitetravel.com"
                className="flex items-center gap-4 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl px-8 py-5 transition-all shadow-xl hover:-translate-y-1 hover:shadow-2xl">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Email Us</p>
                  <p className="font-black text-lg">support@elitetravel.com</p>
                </div>
              </a>
              <a href="tel:+18001234567"
                className="flex items-center gap-4 bg-blue-800 hover:bg-blue-900 text-white rounded-2xl px-8 py-5 transition-all shadow-xl hover:-translate-y-1 hover:shadow-2xl border border-blue-700">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-blue-300 font-bold uppercase tracking-wider">Call Us</p>
                  <p className="font-black text-lg">+1 (800) ELITE-TRV</p>
                </div>
              </a>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
}
