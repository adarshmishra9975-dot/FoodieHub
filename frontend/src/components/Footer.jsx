import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Phone, Mail, MapPin, Heart, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 text-white font-bold text-2xl tracking-tight mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span>
                Foodie<span className="text-orange-500">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-stone-400 leading-relaxed mb-6">
              Your favorite online destination for freshly prepared gourmet pizzas, handcrafted burgers, authentic Indian curries, and comforting desserts.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-stone-800/80 px-3 py-2 rounded-lg border border-stone-700/50">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Open Daily: 10:00 AM – 11:30 PM</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4 tracking-wide uppercase text-xs">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-orange-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-orange-400 transition-colors">
                  Full Menu & Offers
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-orange-400 transition-colors">
                  My Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-orange-400 transition-colors">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-orange-400 transition-colors">
                  About FoodieHub
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-orange-400 transition-colors">
                  Customer Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4 tracking-wide uppercase text-xs">
              Popular Cuisines
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/menu?category=Pizza" className="hover:text-orange-400 transition-colors">
                  Woodfired Pizzas
                </Link>
              </li>
              <li>
                <Link to="/menu?category=Burger" className="hover:text-orange-400 transition-colors">
                  Artisanal Burgers
                </Link>
              </li>
              <li>
                <Link to="/menu?category=Indian" className="hover:text-orange-400 transition-colors">
                  North Indian & Biryani
                </Link>
              </li>
              <li>
                <Link to="/menu?category=Chinese" className="hover:text-orange-400 transition-colors">
                  Wok Noodles & Manchurian
                </Link>
              </li>
              <li>
                <Link to="/menu?category=South Indian" className="hover:text-orange-400 transition-colors">
                  Crisp Dosas & Idlis
                </Link>
              </li>
              <li>
                <Link to="/menu?category=Desserts" className="hover:text-orange-400 transition-colors">
                  Cakes & Warm Gulab Jamun
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Student Info */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4 tracking-wide uppercase text-xs">
              Contact & Location
            </h4>
            <div className="space-y-3 text-sm text-stone-400">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-1" />
                <span>MG Road Hub, City Center, Pune, Maharashtra 411001</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span>support@foodiehub.com</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-800 text-xs text-stone-500">
              <p className="font-semibold text-stone-400">BSc IT Project Capstone</p>
              <p>MERN Stack Architecture (React, Express, Mongoose, JWT)</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} FoodieHub. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for Academic Excellence & Real-World Craftsmanship
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
