import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  UtensilsCrossed,
  ShoppingBag,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Search,
  ChevronDown,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/menu?search=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-stone-900 font-bold text-2xl tracking-tight group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <span>
              Foodie<span className="text-orange-600">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-semibold text-stone-600">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/') ? 'text-orange-600 bg-orange-50' : 'hover:text-orange-600 hover:bg-stone-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/menu"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/menu') ? 'text-orange-600 bg-orange-50' : 'hover:text-orange-600 hover:bg-stone-50'
              }`}
            >
              Menu
            </Link>
            <Link
              to="/about"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/about') ? 'text-orange-600 bg-orange-50' : 'hover:text-orange-600 hover:bg-stone-50'
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`px-3 py-2 rounded-lg transition-colors ${
                isActive('/contact') ? 'text-orange-600 bg-orange-50' : 'hover:text-orange-600 hover:bg-stone-50'
              }`}
            >
              Contact
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-2 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 flex items-center gap-1.5 transition-colors font-medium"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center relative w-64 xl:w-72"
          >
            <input
              type="text"
              placeholder="Search pizza, burger, biryani..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full bg-stone-100/80 border border-stone-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-stone-800"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5" />
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Cart Button */}
            <Link
              to="/cart"
              id="nav-cart-btn"
              className="relative p-2.5 rounded-full text-stone-700 hover:text-orange-600 hover:bg-orange-50 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {totalCount}
                </span>
              )}
            </Link>

            {/* User Account / Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors text-stone-800 text-sm font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline max-w-[110px] truncate">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">Signed in as</p>
                      <p className="text-sm font-semibold text-stone-900 truncate">{user.name}</p>
                      <p className="text-xs text-stone-500 truncate">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="inline-block mt-1 text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                          Administrator
                        </span>
                      )}
                    </div>

                    <Link
                      to="/my-orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <Clock className="w-4 h-4" />
                      My Orders
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-700 hover:bg-orange-50 hover:text-orange-600"
                    >
                      <User className="w-4 h-4" />
                      Profile Settings
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-700 font-medium hover:bg-amber-50"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-stone-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-stone-700 hover:text-orange-600 font-semibold text-sm px-3.5 py-2 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
            <input
              type="text"
              placeholder="Search dishes, burgers, desserts..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full bg-stone-100 border border-stone-200 rounded-lg pl-10 pr-4 py-2 text-sm"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          </form>

          <div className="grid grid-cols-2 gap-2 text-sm font-medium">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg bg-stone-50 hover:bg-orange-50 text-stone-800"
            >
              Home
            </Link>
            <Link
              to="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg bg-stone-50 hover:bg-orange-50 text-stone-800"
            >
              Menu
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg bg-stone-50 hover:bg-orange-50 text-stone-800"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg bg-stone-50 hover:bg-orange-50 text-stone-800"
            >
              Contact
            </Link>
          </div>

          {user ? (
            <div className="pt-2 border-t border-stone-100 space-y-1">
              <Link
                to="/my-orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-orange-50"
              >
                My Orders
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-orange-50"
              >
                My Profile
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-amber-700 bg-amber-50"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-stone-100 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 border border-stone-300 rounded-lg text-stone-800 font-medium text-sm"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 bg-orange-600 text-white rounded-lg font-medium text-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
