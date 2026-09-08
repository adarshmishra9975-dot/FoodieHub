import React from 'react';
import { UtensilsCrossed, Award, Users, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
          Our Story & Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">
          Crafting Delights, One Meal at a Time
        </h1>
        <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
          FoodieHub is a modern full-stack food delivery platform built to connect food enthusiasts with exceptional culinary creations, prompt delivery, and seamless ordering.
        </p>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xs space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-2xl">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-stone-900">Culinary Excellence</h3>
          <p className="text-sm text-stone-500 leading-relaxed">
            Our recipes are engineered using authentic regional spices, fresh dough fermented daily, and premium cuts for an unforgettable dining experience.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xs space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-stone-900">FSSAI Certified Safety</h3>
          <p className="text-sm text-stone-500 leading-relaxed">
            Every meal is prepared in sanitised kitchen pods adhering to strict temperature standards, sealed packaging, and contactless dispatch.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xs space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-stone-900">Technology Driven</h3>
          <p className="text-sm text-stone-500 leading-relaxed">
            Powered by a responsive MERN architecture featuring instant cart updates, role-based administration, and live tracking workflows.
          </p>
        </div>
      </div>

      {/* Project Background Showcase (Great for BSc IT viva / demonstration) */}
      <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 space-y-6">
        <div className="max-w-2xl space-y-3">
          <span className="bg-orange-600/30 text-orange-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Academic Project Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            BSc IT Capstone Implementation
          </h2>
          <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
            This project exemplifies clean separation of concerns, RESTful API conventions, password hashing using bcrypt, JWT token authentication, and a reactive state management model on the client side.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 text-stone-300 text-xs">
          <div className="bg-stone-800/80 p-4 rounded-2xl border border-stone-700 space-y-1">
            <p className="font-bold text-white text-sm">Frontend Layer</p>
            <p className="text-stone-400">React.js, Vite, React Router DOM, Tailwind CSS, Lucide Icons</p>
          </div>
          <div className="bg-stone-800/80 p-4 rounded-2xl border border-stone-700 space-y-1">
            <p className="font-bold text-white text-sm">Backend Services</p>
            <p className="text-stone-400">Node.js, Express.js, REST API endpoints, JWT Middleware</p>
          </div>
          <div className="bg-stone-800/80 p-4 rounded-2xl border border-stone-700 space-y-1">
            <p className="font-bold text-white text-sm">Database Tier</p>
            <p className="text-stone-400">MongoDB with Mongoose ODM (Users, Foods, Orders collections)</p>
          </div>
          <div className="bg-stone-800/80 p-4 rounded-2xl border border-stone-700 space-y-1">
            <p className="font-bold text-white text-sm">Role-Based Access</p>
            <p className="text-stone-400">Granular Customer & Admin control panels with secure tokens</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
