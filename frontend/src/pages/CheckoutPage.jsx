import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CheckoutPage = () => {
  const { cartItems, subtotal, deliveryCharge, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Address and contact state
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: user?.address || '',
    city: 'Pune',
    pincode: '411001',
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-900">Your Cart is Empty</h2>
        <p className="text-stone-500 text-sm">Please add items to cart before proceeding to checkout.</p>
        <Link
          to="/menu"
          className="inline-block bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError(null);

    // Form validation
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.street.trim() || !formData.city.trim() || !formData.pincode.trim()) {
      setError('Please fill in all shipping details (Name, Phone, Street, City, and Pincode).');
      return;
    }

    try {
      setLoading(true);

      const orderPayload = {
        items: cartItems.map((item) => ({
          food: item.food || item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        address: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          street: formData.street.trim(),
          city: formData.city.trim(),
          pincode: formData.pincode.trim(),
        },
        phone: formData.phone.trim(),
        paymentMethod,
        deliveryCharge,
      };

      const res = await api.post('/orders', orderPayload);

      if (res.data?.success && res.data.order) {
        clearCart();
        navigate(`/order-success/${res.data.order.orderId || res.data.order._id}`, {
          state: { order: res.data.order },
        });
      } else {
        throw new Error(res.data?.message || 'Failed to submit order');
      }
    } catch (err) {
      console.error('[Checkout Error]', err);
      setError(err.message || 'Something went wrong while placing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Title */}
      <div className="mb-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-orange-600 mb-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
          Checkout & Order Confirmation
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Review your delivery details and choose your preferred payment option.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Shipping Address & Payment */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Delivery Address Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-orange-600" />
                  Delivery Address
                </h2>
                <span className="text-xs text-stone-400 font-medium">Step 1 of 2</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Street Address / Flat / Building *
                  </label>
                  <textarea
                    rows={2}
                    name="street"
                    required
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="e.g. Flat 402, Green Valley Towers, MG Road"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Pune"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 411001"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-600" />
                  Select Payment Option
                </h2>
                <span className="text-xs text-stone-400 font-medium">Step 2 of 2</span>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label
                  className={`flex items-start p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-orange-600 bg-orange-50/50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 text-orange-600 focus:ring-orange-500 h-4 w-4"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Pay easily via cash or UPI QR directly to the delivery rider upon arrival.
                    </p>
                  </div>
                </label>

                {/* Online Payment (Mockup Architecture UI) */}
                <label
                  className={`flex items-start p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'Online Payment'
                      ? 'border-orange-600 bg-orange-50/50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online Payment"
                    checked={paymentMethod === 'Online Payment'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 text-orange-600 focus:ring-orange-500 h-4 w-4"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        Online Payment (Cards / UPI / NetBanking)
                      </span>
                      <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Instant
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Pay safely using UPI apps (GPay, PhonePe, Paytm) or Credit/Debit Cards.
                    </p>

                    {paymentMethod === 'Online Payment' && (
                      <div className="mt-3 p-3 bg-white border border-stone-200 rounded-xl text-xs text-stone-600 space-y-2">
                        <p className="font-semibold text-stone-800">
                          Demo Payment Gateway Simulation:
                        </p>
                        <div className="flex items-center gap-2 text-stone-500">
                          <Lock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Order will be marked as "Paid" automatically on confirmation.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6 sticky top-28">
            <h2 className="text-xl font-extrabold text-stone-900 border-b border-stone-100 pb-4">
              Order Summary
            </h2>

            {/* Items list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 pr-1 space-y-2">
              {cartItems.map((item) => {
                const id = item.food || item._id;
                return (
                  <div key={id} className="pt-2 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg bg-stone-100 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-stone-800 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-stone-500">
                          {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900">₹{item.price * item.quantity}</span>
                  </div>
                );
              })}
            </div>

            {/* Pricing details */}
            <div className="space-y-3 pt-4 border-t border-stone-100 text-sm text-stone-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900">₹{subtotal}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Delivery Charge</span>
                <span className={`font-bold ${deliveryCharge === 0 ? 'text-emerald-600' : 'text-stone-900'}`}>
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-lg font-extrabold text-stone-900">
                <span>Grand Total</span>
                <span className="text-orange-600 text-2xl font-black">₹{totalAmount}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 active:scale-98 disabled:opacity-60 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 text-base transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Placing Your Order...</span>
                </div>
              ) : (
                <>
                  <span>Place Order • ₹{totalAmount}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-stone-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Orders saved securely in MongoDB database</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
