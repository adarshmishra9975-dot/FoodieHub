import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Minus, Check, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const FoodCard = ({ food }) => {
  const { cartItems, addToCart, updateQuantity } = useCart();

  if (!food) return null;

  // Check if item is already in cart
  const cartItem = cartItems.find(
    (item) => (item.food || item._id) === food._id
  );

  const isAvailable = food.available !== false;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Food Image & Badges */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <Link to={`/food/${food._id}`}>
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Veg / Non-Veg Indicator */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs p-1.5 rounded-lg shadow-sm">
          <div
            className={`w-4 h-4 border-2 flex items-center justify-center rounded-xs ${
              food.isVeg ? 'border-emerald-600' : 'border-rose-600'
            }`}
            title={food.isVeg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                food.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            />
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 text-xs font-bold text-stone-800">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{Number(food.rating || 4.5).toFixed(1)}</span>
        </div>

        {/* Unavailable overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Food Info Body */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
              {food.category}
            </span>
          </div>

          <Link to={`/food/${food._id}`}>
            <h3 className="text-base font-bold text-stone-900 hover:text-orange-600 transition-colors line-clamp-1">
              {food.name}
            </h3>
          </Link>

          <p className="mt-1.5 text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {food.description}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 block font-medium">Price</span>
            <span className="text-lg font-extrabold text-stone-900">₹{food.price}</span>
          </div>

          <div>
            {isAvailable ? (
              cartItem ? (
                <div className="flex items-center bg-orange-50 border border-orange-200 rounded-xl overflow-hidden shadow-xs">
                  <button
                    onClick={() => updateQuantity(food._id, cartItem.quantity - 1)}
                    className="p-1.5 text-orange-700 hover:bg-orange-100 transition-colors"
                    title="Decrease"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 font-bold text-sm text-orange-900 min-w-[28px] text-center">
                    {cartItem.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(food._id, cartItem.quantity + 1)}
                    className="p-1.5 text-orange-700 hover:bg-orange-100 transition-colors"
                    title="Increase"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(food, 1)}
                  className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add to Cart
                </button>
              )
            ) : (
              <span className="text-xs text-stone-400 font-medium italic">Sold Out</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
