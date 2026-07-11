import { Globe, Share2, MessageCircle, Heart, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-50 text-slate-600 pt-20 pb-8 border-t border-slate-200">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 text-2xl font-black text-slate-900">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-md shadow-primary-600/20">
                <Globe className="w-6 h-6 text-white" />
              </div>
              EliteTravel
            </Link>
            <p className="text-sm leading-relaxed font-medium">
              Your premium partner for global exploration. We provide world-class travel services, flights, visas, and unforgettable tourism packages.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all shadow-sm"><Share2 className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all shadow-sm"><MessageCircle className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all shadow-sm"><Heart className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-slate-900 font-bold mb-6 text-lg tracking-tight">Quick Links</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/about" className="hover:text-primary-600 transition-colors flex items-center gap-2 group"><ChevronRight className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform" /> About Us</Link></li>
              <li><Link to="/flights" className="hover:text-primary-600 transition-colors flex items-center gap-2 group"><ChevronRight className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform" /> Book a Flight</Link></li>
              <li><Link to="/visa" className="hover:text-primary-600 transition-colors flex items-center gap-2 group"><ChevronRight className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform" /> Visa Services</Link></li>
              <li><Link to="/tourism" className="hover:text-primary-600 transition-colors flex items-center gap-2 group"><ChevronRight className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform" /> Tour Packages</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-slate-900 font-bold mb-6 text-lg tracking-tight">Our Services</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="hover:text-primary-600 transition-colors flex items-center gap-2 group cursor-pointer"><ChevronRight className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform" /> Flight Bookings</li>
              <li className="hover:text-primary-600 transition-colors flex items-center gap-2 group cursor-pointer"><ChevronRight className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform" /> Global Visas</li>
              <li className="hover:text-primary-600 transition-colors flex items-center gap-2 group cursor-pointer"><ChevronRight className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform" /> Holiday Packages</li>
              <li className="hover:text-primary-600 transition-colors flex items-center gap-2 group cursor-pointer"><ChevronRight className="w-4 h-4 text-primary-400 group-hover:translate-x-1 transition-transform" /> Cargo Services</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-slate-900 font-bold mb-6 text-lg tracking-tight">Contact Us</h4>
            <ul className="space-y-5 text-sm font-medium">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-primary-600" />
                </div>
                <span className="pt-1.5">123 Elite Boulevard, Skyline District, Global City, GC 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-primary-600" />
                </div>
                <span>+1 (800) ELITE-TRV</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary-600" />
                </div>
                <span>support@elitetravel.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <p>&copy; {new Date().getFullYear()} EliteTravel Agency. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
