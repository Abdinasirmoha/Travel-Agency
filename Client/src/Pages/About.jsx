import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Globe, Users, Heart, Award, MapPin, Phone, Mail, ArrowRight, Compass, ShieldCheck } from 'lucide-react';

const team = [
  { name: 'Alex Sterling', role: 'CEO & Founder', image: '/images/team_alex.jpg' },
  { name: 'Sarah Mitchell', role: 'Head of Visa Services', image: '/images/team_sarah.jpg' },
  { name: 'Omar Hassan', role: 'Flight Operations', image: '/images/team_omar.jpg' },
  { name: 'Lisa Chen', role: 'Customer Success', image: '/images/team_lisa.jpg' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      <div className="pt-20">
        
        {/* Advanced Hero Section */}
        <div className="relative bg-primary-600 pt-24 pb-48 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/about_hero.jpg')" }} />
          <div className="absolute inset-0 bg-slate-900/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-primary-900/50 to-transparent" />
          
          <div className="container mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white border border-white/30 rounded-full px-5 py-2 text-sm font-bold mb-6 backdrop-blur-sm tracking-wide uppercase">
              <Compass className="w-4 h-4" />
              Our Story
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-lg">
              Redefining <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-white">Travel Excellence</span>
            </h1>
            <p className="text-primary-100 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md">
              For over 15 years, EliteTravel has been seamlessly connecting people to the world's most extraordinary destinations. We are more than a travel agency — we are the architects of your next unforgettable journey.
            </p>
          </div>
        </div>

        {/* Floating Stats Ribbon */}
        <div className="container mx-auto px-6 relative z-20 -mt-24 mb-24">
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-primary-900/10 border-2 border-slate-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
              {[
                { label: 'Destinations', value: '500+', icon: Globe },
                { label: 'Happy Travelers', value: '10k+', icon: Users },
                { label: 'Years Experience', value: '15+', icon: Award },
                { label: 'Global Rating', value: '4.9★', icon: Heart },
              ].map((stat, i) => (
                <div key={i} className={`text-center ${i !== 0 ? 'pl-8' : ''}`}>
                  <div className="w-12 h-12 mx-auto bg-primary-50 rounded-2xl flex items-center justify-center mb-4 text-primary-600">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-1">{stat.value}</h3>
                  <p className="text-slate-500 font-medium text-sm uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mission & Vision Split Section */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <p className="text-primary-600 font-bold tracking-widest uppercase text-sm mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> Our Mission
                </p>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                  Making World Travel <br/> Accessible to Everyone
                </h2>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                We believe travel transforms lives. Our mission is to remove every barrier between you and your dream destination — whether it's finding the best flight deals, processing your visa swiftly, or curating an unforgettable holiday package.
              </p>
              <div className="bg-slate-50 border-l-4 border-primary-600 p-6 rounded-r-2xl">
                <p className="text-slate-700 italic text-lg font-medium">
                  "With a dedicated team of passionate travel experts and a network spanning 50+ premium airlines and 500+ exclusive destinations, we deliver world-class travel experiences at accessible prices."
                </p>
              </div>
              <button className="inline-flex items-center gap-2 text-primary-600 font-bold hover:text-primary-700 transition-colors group">
                Discover our services <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            {/* Image side */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary-600 translate-x-4 translate-y-4 rounded-[2rem] opacity-20"></div>
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-900/20 group">
                <img src="/images/about_vision.jpg" alt="Vintage Compass" className="w-full h-[600px] object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-6 text-white">
                    <h3 className="text-xl font-bold mb-2">Guided by Excellence</h3>
                    <p className="text-white/80 text-sm font-medium">Every journey we plan is crafted with precision, care, and a deep understanding of what makes travel truly magical.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Team Section */}
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <p className="text-primary-600 font-bold tracking-widest uppercase text-sm mb-3">Our People</p>
              <h2 className="text-4xl font-black text-slate-900 mb-4">Meet Our Expert Team</h2>
              <p className="text-slate-500 text-lg font-medium">A passionate group of travel professionals dedicated to making your journey absolutely perfect.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map(({ name, role, image }) => (
                <div key={name} className="bg-white rounded-3xl p-8 text-center border-2 border-slate-100 hover:border-primary-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                  <div className="w-24 h-24 rounded-full mx-auto mb-6 shadow-lg shadow-primary-500/30 overflow-hidden group-hover:scale-110 group-hover:shadow-primary-500/50 transition-all duration-300 border-4 border-white">
                    <img src={image} alt={name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-black text-slate-900 text-xl">{name}</h3>
                  <p className="text-primary-600 font-bold text-sm mt-1">{role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-24 bg-primary-600 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-900/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
          
          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Have Questions? Get In Touch</h2>
            <p className="text-primary-100 text-lg mb-12 max-w-2xl mx-auto font-medium">Our global team of travel concierges is available 24/7 to help you plan your perfect itinerary.</p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a href="mailto:support@elitetravel.com" className="flex items-center gap-4 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl px-8 py-5 transition-all shadow-xl hover:-translate-y-1 hover:shadow-2xl">
                <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Email Us</p>
                  <p className="font-black text-lg">support@elitetravel.com</p>
                </div>
              </a>
              <a href="tel:+18001234567" className="flex items-center gap-4 bg-primary-900 hover:bg-slate-900 text-white rounded-2xl px-8 py-5 transition-all shadow-xl hover:-translate-y-1 hover:shadow-2xl border border-primary-800">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-primary-200 font-bold uppercase tracking-wider">Call Us</p>
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
