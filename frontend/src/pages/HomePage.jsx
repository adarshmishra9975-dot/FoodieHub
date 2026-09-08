import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Clock,
  ShieldCheck,
  Truck,
  Sparkles,
  Flame,
  Award,
  ChevronRight,
  Pizza,
  Utensils,
} from 'lucide-react';
import api from '../services/api';
import FoodCard from '../components/FoodCard';

const CATEGORIES = [
  { name: 'Pizza', icon: '🍕', color: 'bg-amber-100 text-amber-900 border-amber-200' },
  { name: 'Burger', icon: '🍔', color: 'bg-orange-100 text-orange-900 border-orange-200' },
  { name: 'Indian', icon: '🍛', color: 'bg-rose-100 text-rose-900 border-rose-200' },
  { name: 'Chinese', icon: '🥡', color: 'bg-red-100 text-red-900 border-red-200' },
  { name: 'South Indian', icon: '🥞', color: 'bg-yellow-100 text-yellow-900 border-yellow-200' },
  { name: 'Snacks', icon: '🍟', color: 'bg-lime-100 text-lime-900 border-lime-200' },
  { name: 'Desserts', icon: '🍰', color: 'bg-pink-100 text-pink-900 border-pink-200' },
  { name: 'Beverages', icon: '🥤', color: 'bg-sky-100 text-sky-900 border-sky-200' },
];

const HomePage = () => {
  const [popularDishes, setPopularDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopularFoods = async () => {
      try {
        setLoading(true);
        // Fetch top rated dishes from backend API
        const res = await api.get('/foods?sort=rating');
        if (res.data && res.data.foods) {
          setPopularDishes(res.data.foods.slice(0, 8));
        }
      } catch (err) {
        console.error('Failed to load popular dishes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularFoods();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/menu');
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-amber-50/40 to-white pt-8 sm:pt-14 pb-12 sm:pb-20 border-b border-orange-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs sm:text-sm font-semibold tracking-wide shadow-2xs">
                <Flame className="w-4 h-4 text-orange-600 fill-orange-600" />
                <span>Super Fast 30-Minute Food Delivery in Town</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.15]">
                Order Your <span className="text-orange-600">Favourite Food</span> Delivered Fresh & Hot!
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Craving gourmet stone-baked pizzas, juicy handcrafted burgers, or royal dum biryani? FoodieHub connects your tastebuds to delicious meals prepared with top hygiene standards.
              </p>

              {/* Hero Search Box */}
              <form
                onSubmit={handleHeroSearch}
                className="max-w-xl mx-auto lg:mx-0 flex items-center bg-white p-2 rounded-2xl shadow-lg shadow-orange-950/5 border border-stone-200"
              >
                <div className="pl-3 text-stone-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="What are you craving today? (e.g. Pizza, Dosa, Shake)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm sm:text-base text-stone-900 focus:outline-none bg-transparent"
                />
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-5 sm:px-7 py-3 rounded-xl font-bold text-sm sm:text-base transition-all shrink-0 shadow-md shadow-orange-600/20"
                >
                  Find Food
                </button>
              </form>

              {/* Quick Tags / CTA */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 bg-stone-900 hover:bg-black text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-md transition-all hover:gap-3"
                >
                  <span>Explore Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex items-center gap-6 text-xs sm:text-sm text-stone-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    FSSAI Verified
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-orange-600" />
                    30 Min ETA
                  </span>
                </div>
              </div>
            </div>

            {/* Right Visual Image Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative background glow */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-orange-400 to-amber-300 rounded-3xl opacity-20 blur-2xl"></div>

                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80"
                    alt="Delicious Gourmet Food Selection"
                    className="w-full h-80 sm:h-96 object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white">
                    <span className="bg-orange-600 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                      Chef's Special
                    </span>
                    <h3 className="text-xl font-bold mt-1.5">Fresh Authentic Flavors</h3>
                    <p className="text-xs text-stone-300 mt-1">Made from hand-picked fresh ingredients daily.</p>
                  </div>
                </div>

                {/* Floating highlight badge */}
                <div className="absolute -bottom-5 -left-5 bg-white p-3.5 rounded-2xl shadow-xl border border-stone-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    4.9★
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">10,000+ Happy Orders</p>
                    <p className="text-[11px] text-stone-500">Rated 4.9 on Google Reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FOOD CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Explore Cuisines
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
              Popular Food Categories
            </h2>
          </div>
          <Link
            to="/menu"
            className="text-sm font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 mt-2 md:mt-0"
          >
            View All Dishes
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/menu?category=${encodeURIComponent(cat.name)}`}
              className="bg-white rounded-2xl p-4 text-center border border-stone-200/80 shadow-xs hover:shadow-md hover:border-orange-300 hover:-translate-y-1 transition-all group flex flex-col items-center justify-center"
            >
              <div className={`w-14 h-14 rounded-2xl ${cat.color} border flex items-center justify-center text-2xl mb-2.5 shadow-2xs group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <span className="text-xs sm:text-sm font-bold text-stone-800 group-hover:text-orange-600 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. POPULAR DISHES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Customer Favorites
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
              Popular Dishes This Week
            </h2>
          </div>
          <Link
            to="/menu"
            className="text-sm font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 mt-2 md:mt-0"
          >
            Explore Complete Menu
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl p-4 border border-stone-200 animate-pulse space-y-4"
              >
                <div className="h-44 bg-stone-200 rounded-xl"></div>
                <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                <div className="h-3 bg-stone-100 rounded w-full"></div>
                <div className="h-8 bg-stone-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : popularDishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularDishes.map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8">
            <Utensils className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <p className="text-stone-600 font-medium">No dishes found right now.</p>
            <Link
              to="/menu"
              className="mt-3 inline-block text-sm font-bold text-orange-600 underline"
            >
              Browse menu categories
            </Link>
          </div>
        )}
      </section>

      {/* 4. SPECIAL OFFERS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Exclusive Deals
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
            Special Discounts & Combos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Offer 1 */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-2">
              <span className="bg-white/20 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                First Order Special
              </span>
              <h3 className="text-2xl font-extrabold">Flat 20% OFF</h3>
              <p className="text-orange-100 text-xs sm:text-sm">
                Use code <span className="font-mono font-bold text-white bg-black/20 px-2 py-0.5 rounded">WELCOME20</span> on your first order.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/20">
              <Link
                to="/menu"
                className="bg-white text-orange-600 hover:bg-orange-50 text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 transition-colors"
              >
                Claim Offer
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Offer 2 */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-2">
              <span className="bg-orange-500/30 text-orange-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Free Delivery
              </span>
              <h3 className="text-2xl font-extrabold">Orders Above ₹500</h3>
              <p className="text-stone-400 text-xs sm:text-sm">
                Save ₹40 on shipping automatically applied on every cart with ₹500 or more!
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-700">
              <Link
                to="/menu"
                className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 transition-colors"
              >
                Order Now
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Offer 3 */}
          <div className="bg-gradient-to-br from-rose-600 to-pink-600 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-2">
              <span className="bg-white/20 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Weekend Treat
              </span>
              <h3 className="text-2xl font-extrabold">Free Lava Cake</h3>
              <p className="text-rose-100 text-xs sm:text-sm">
                Complimentary chocolate lava cake on all Gourmet Woodfired Pizzas.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/20">
              <Link
                to="/menu?category=Pizza"
                className="bg-white text-rose-600 hover:bg-rose-50 text-xs font-bold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 transition-colors"
              >
                View Pizzas
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE US SECTION */}
      <section className="bg-stone-100/70 py-16 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Our Promise
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
              Why Food Lovers Choose FoodieHub
            </h2>
            <p className="text-sm text-stone-600 mt-2">
              We bring restaurant-quality food directly to your doorstep with zero hassle and unmatched freshness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-xl">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-base">30 Min Fast Delivery</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Our hyper-local fleet ensures your meal arrives piping hot, sealed, and ready to feast.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-base">100% Hygienic Food</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Prepared in strictly sanitised kitchens by certified master chefs using fresh produce.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto text-xl">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-base">Live Order Tracking</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Monitor your order progression from kitchen preparation to rider dispatch in real time.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-xl">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-base">Best Taste Guaranteed</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Authentic recipes, aromatic spice blends, and unforgettable indulgence in every bite.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-3xl p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-orange-600/20">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold">Ready to Savor Delicious Meals?</h3>
            <p className="text-orange-100 text-sm sm:text-base">
              Explore 20+ dishes across pizzas, burgers, biryanis, and desserts. Order now with Cash on Delivery!
            </p>
          </div>
          <Link
            to="/menu"
            className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 py-3.5 rounded-xl shadow-md transition-transform hover:scale-105 shrink-0 text-base"
          >
            Order Food Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
