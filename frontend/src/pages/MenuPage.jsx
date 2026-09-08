import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RotateCcw, Utensils } from 'lucide-react';
import api from '../services/api';
import FoodCard from '../components/FoodCard';

const CATEGORIES = [
  'All',
  'Pizza',
  'Burger',
  'Indian',
  'Chinese',
  'South Indian',
  'Snacks',
  'Desserts',
  'Beverages',
];

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query params
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [vegFilter, setVegFilter] = useState('all'); // 'all' | 'veg' | 'non-veg'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price-asc' | 'price-desc' | 'rating'

  // Sync category or search from URL if changed
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
    const s = searchParams.get('search');
    if (s !== null && s !== searchTerm) {
      setSearchTerm(s);
      setDebouncedSearch(s);
    }
  }, [searchParams]);

  // Debounce search typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch foods from backend API
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();

        if (selectedCategory && selectedCategory !== 'All') {
          params.append('category', selectedCategory);
        }

        if (debouncedSearch.trim()) {
          params.append('search', debouncedSearch.trim());
        }

        if (vegFilter === 'veg') {
          params.append('isVeg', 'true');
        } else if (vegFilter === 'non-veg') {
          params.append('isVeg', 'false');
        }

        if (sortBy) {
          params.append('sort', sortBy);
        }

        const response = await api.get(`/foods?${params.toString()}`);
        setFoods(response.data.foods || []);
      } catch (err) {
        console.error('Error fetching foods:', err);
        setError(err.message || 'Failed to load food menu. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, [selectedCategory, debouncedSearch, vegFilter, sortBy]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchTerm('');
    setDebouncedSearch('');
    setVegFilter('all');
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
          Delicious Offerings
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-1">
          Explore Our Food Menu
        </h1>
        <p className="text-sm sm:text-base text-stone-600 mt-2">
          Discover a wide range of mouth-watering dishes crafted with love and fresh ingredients.
        </p>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200/80 shadow-xs mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <input
              type="text"
              placeholder="Search by dish name, category, or ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-xs text-stone-400 hover:text-stone-600 bg-stone-200 px-1.5 py-0.5 rounded"
              >
                Clear
              </button>
            )}
          </div>

          {/* Veg / Non-Veg Toggle Filter */}
          <div className="md:col-span-3 flex items-center bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setVegFilter('all')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                vegFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setVegFilter('veg')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors ${
                vegFilter === 'veg'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              Veg
            </button>
            <button
              onClick={() => setVegFilter('non-veg')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors ${
                vegFilter === 'non-veg'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              Non-Veg
            </button>
          </div>

          {/* Sorting Dropdown */}
          <div className="md:col-span-3 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-stone-400 shrink-0 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              <option value="newest">Sort By: Featured / Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated (★)</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filters & Results Count */}
      <div className="flex items-center justify-between mb-6 text-xs sm:text-sm text-stone-500">
        <p>
          Showing <span className="font-bold text-stone-900">{foods.length}</span> dishes
          {selectedCategory !== 'All' && (
            <span> in category <strong className="text-orange-600">"{selectedCategory}"</strong></span>
          )}
          {debouncedSearch && (
            <span> matching <strong className="text-orange-600">"{debouncedSearch}"</strong></span>
          )}
        </p>

        {(selectedCategory !== 'All' || debouncedSearch || vegFilter !== 'all' || sortBy !== 'newest') && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 text-orange-600 hover:text-orange-800 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>

      {/* Food Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl p-4 border border-stone-200 animate-pulse space-y-3"
            >
              <div className="h-44 bg-stone-200 rounded-xl"></div>
              <div className="h-4 bg-stone-200 rounded w-3/4"></div>
              <div className="h-3 bg-stone-100 rounded w-full"></div>
              <div className="h-8 bg-stone-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-rose-200 p-8">
          <p className="text-rose-600 font-bold mb-2">Error loading menu</p>
          <p className="text-stone-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-600 text-white px-5 py-2 rounded-xl text-sm font-bold"
          >
            Retry
          </button>
        </div>
      ) : foods.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {foods.map((food) => (
            <FoodCard key={food._id} food={food} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
          <Utensils className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-800">No dishes match your filters</h3>
          <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
            Try searching for something else or reset your category and dietary filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-5 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all"
          >
            Show All Dishes
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
