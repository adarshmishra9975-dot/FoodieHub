import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryCharge,
    totalAmount,
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">Your Cart is Empty</h2>
        <p className="text-stone-500 text-sm sm:text-base mt-2 max-w-md mx-auto">
          Looks like you haven't added any delicious food items to your cart yet. Explore our mouth-watering menu!
        </p>
        <div className="mt-8">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-orange-600/25 transition-all hover:scale-105"
          >
            <span>Explore Full Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckoutClick = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const amountToFreeDelivery = Math.max(0, 500 - subtotal);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-orange-600 mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Continue Browsing Menu
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
            Shopping Cart ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-800 self-start sm:self-auto flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free delivery prompt banner */}
          {subtotal < 500 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between text-xs sm:text-sm text-amber-900">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Add dishes worth <strong>₹{amountToFreeDelivery}</strong> more to unlock <strong>FREE Delivery</strong>!
              </span>
              <Link to="/menu" className="font-bold underline text-amber-800 hover:text-amber-950 shrink-0 ml-2">
                Add Items
              </Link>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-2 text-xs sm:text-sm text-emerald-900 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Awesome! You have unlocked FREE Delivery for this order!
            </div>
          )}

          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden">
            {cartItems.map((item) => {
              const id = item.food || item._id;
              return (
                <div
                  key={id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/50 transition-colors"
                >
                  {/* Food Image + Info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-stone-100 shrink-0 border border-stone-200"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 border flex items-center justify-center rounded-2xs ${
                            item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                        </span>
                        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-stone-900 text-base sm:text-lg">
                        {item.name}
                      </h3>
                      <p className="text-sm font-extrabold text-stone-800">
                        ₹{item.price} <span className="text-xs text-stone-400 font-normal">each</span>
                      </p>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    <div className="flex items-center bg-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => updateQuantity(id, item.quantity - 1)}
                        className="p-2 text-stone-700 hover:bg-stone-200 transition-colors"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 font-bold text-sm text-stone-900 min-w-[28px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(id, item.quantity + 1)}
                        className="p-2 text-stone-700 hover:bg-stone-200 transition-colors"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <span className="text-xs text-stone-400 block sm:hidden">Total</span>
                      <span className="font-extrabold text-stone-900 text-base">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(id)}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove dish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Bill Summary */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6 sticky top-28">
          <h2 className="text-xl font-extrabold text-stone-900 border-b border-stone-100 pb-4">
            Bill Summary
          </h2>

          <div className="space-y-3 text-sm text-stone-600">
            <div className="flex items-center justify-between">
              <span>Item Subtotal</span>
              <span className="font-bold text-stone-900">₹{subtotal}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                Delivery Charge
                {deliveryCharge === 0 && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                    FREE
                  </span>
                )}
              </span>
              <span className={`font-bold ${deliveryCharge === 0 ? 'text-emerald-600' : 'text-stone-900'}`}>
                {deliveryCharge === 0 ? '₹0' : `₹${deliveryCharge}`}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-400">
              <span>Restaurant Packaging & Taxes</span>
              <span className="font-semibold text-stone-700">Included</span>
            </div>

            <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-base sm:text-lg">
              <span className="font-extrabold text-stone-900">Grand Total</span>
              <span className="font-black text-orange-600 text-xl sm:text-2xl">
                ₹{totalAmount}
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckoutClick}
            className="w-full bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 text-base transition-all"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {!user && (
            <p className="text-xs text-center text-stone-500">
              You will be prompted to log in or register before completing checkout.
            </p>
          )}

          <div className="pt-2 border-t border-stone-100 text-xs text-stone-400 space-y-1.5">
            <p className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Safe and Secure Checkout
            </p>
            <p className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Cash on Delivery Supported
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
