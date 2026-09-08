import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Clock,
  Flame,
  CheckCircle,
  Utensils,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import FoodCard from '../components/FoodCard';

const FoodDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  const [food, setFood] = useState(null);
  const [relatedFoods, setRelatedFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchFoodDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        setQuantity(1);

        const res = await api.get(`/foods/${id}`);
        if (res.data?.food) {
          setFood(res.data.food);

          // Fetch related foods in the same category
          const relatedRes = await api.get(`/foods?category=${res.data.food.category}`);
          if (relatedRes.data?.foods) {
            setRelatedFoods(
              relatedRes.data.foods.filter((f) => f._id !== res.data.food._id).slice(0, 4)
            );
          }
        }
      } catch (err) {
        console.error('Error fetching food detail:', err);
        setError(err.message || 'Food item could not be found');
      } finally {
        setLoading(false);
      }
    };

    fetchFoodDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-stone-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-80 bg-stone-200 rounded-3xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-stone-200 rounded w-3/4"></div>
            <div className="h-6 bg-stone-200 rounded w-1/4"></div>
            <div className="h-20 bg-stone-100 rounded"></div>
            <div className="h-12 bg-stone-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !food) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Utensils className="w-12 h-12 text-stone-400 mx-auto" />
        <h2 className="text-xl font-bold text-stone-800">Food Item Not Found</h2>
        <p className="text-sm text-stone-500">{error || "This dish is either unavailable or has been removed."}</p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </Link>
      </div>
    );
  }

  const isAvailable = food.available !== false;
  const isAlreadyInCart = cartItems.some((item) => (item.food || item._id) === food._id);

  const handleAddToCart = () => {
    if (isAvailable) {
      addToCart(food, quantity);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-stone-600 hover:text-orange-600 font-semibold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </button>
      </div>

      {/* Main Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 bg-white p-6 sm:p-10 rounded-3xl border border-stone-200/80 shadow-xs">
        {/* Left: Large Food Image */}
        <div className="md:col-span-6 relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 shadow-md">
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover"
          />

          {/* Veg/Non-Veg Badge */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl shadow-md flex items-center gap-2">
            <div
              className={`w-4 h-4 border-2 flex items-center justify-center rounded-xs ${
                food.isVeg ? 'border-emerald-600' : 'border-rose-600'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  food.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              />
            </div>
            <span className="text-xs font-bold text-stone-800">
              {food.isVeg ? 'Vegetarian' : 'Non-Veg'}
            </span>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 text-sm font-bold text-stone-900">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{Number(food.rating || 4.5).toFixed(1)}</span>
          </div>

          {!isAvailable && (
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-rose-600 text-white font-bold px-4 py-2 rounded-xl text-sm uppercase tracking-wider">
                Temporarily Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Right: Food Details & Add to Cart */}
        <div className="md:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-orange-200">
                {food.category}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  isAvailable
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {isAvailable ? 'In Stock & Fresh' : 'Out of Stock'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight">
              {food.name}
            </h1>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-stone-900">₹{food.price}</span>
              <span className="text-xs text-stone-500 font-medium">inclusive of all taxes</span>
            </div>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              {food.description}
            </p>

            {/* Ingredients Tags */}
            {food.ingredients && food.ingredients.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Key Ingredients:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {food.ingredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="bg-stone-100 text-stone-700 text-xs font-medium px-3 py-1 rounded-lg border border-stone-200"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity & Add to Cart Actions */}
          <div className="pt-6 border-t border-stone-100 space-y-4">
            {isAvailable ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* Quantity Control */}
                <div className="flex items-center justify-between sm:justify-center bg-stone-100 border border-stone-200 rounded-2xl p-1.5 px-3">
                  <span className="text-xs font-bold text-stone-500 sm:hidden">Quantity</span>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-9 h-9 rounded-xl bg-white text-stone-800 flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 disabled:opacity-40 transition-colors shadow-2xs"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-extrabold text-stone-900 text-base">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-9 h-9 rounded-xl bg-white text-stone-800 flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 transition-colors shadow-2xs"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 text-sm sm:text-base transition-all"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Add {quantity} to Cart • ₹{food.price * quantity}</span>
                </button>
              </div>
            ) : (
              <div className="bg-stone-100 text-stone-500 text-center py-3 rounded-2xl font-bold text-sm">
                This item is currently sold out. Please check back shortly!
              </div>
            )}

            {isAlreadyInCart && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                This dish is currently in your cart. You can also edit it during checkout.
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-stone-500 font-medium">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>30-40 Mins Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Hygiene Inspected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Dishes Section */}
      {relatedFoods.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-stone-900">
              More in <span className="text-orange-600">{food.category}</span>
            </h3>
            <Link
              to={`/menu?category=${food.category}`}
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              View All {food.category}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedFoods.map((item) => (
              <FoodCard key={item._id} food={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodDetailPage;
