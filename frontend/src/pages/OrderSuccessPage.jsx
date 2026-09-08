import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Clock, MapPin, ArrowRight, ShoppingBag, Utensils } from 'lucide-react';
import api from '../services/api';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && id) {
      const fetchOrder = async () => {
        try {
          const res = await api.get(`/orders/${id}`);
          if (res.data?.order) {
            setOrder(res.data.order);
          }
        } catch (err) {
          console.error('Failed to fetch order details:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id, order]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
      {/* Success Badge */}
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-500/10">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
        Order Confirmed!
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-1">
        Thank You For Your Order!
      </h1>
      <p className="text-stone-600 text-sm sm:text-base mt-2 max-w-md mx-auto">
        Your delicious food is being prepped in the kitchen. We'll deliver it to your doorstep shortly.
      </p>

      {/* Order Highlights Card */}
      <div className="mt-8 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs text-left space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-4">
          <div>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Order Reference</p>
            <p className="text-xl font-black text-orange-600">{order?.orderId || id}</p>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-3.5 py-2 rounded-xl text-orange-800 text-xs font-bold">
            <Clock className="w-4 h-4 text-orange-600" />
            <span>Estimated Delivery: 30 - 40 Mins</span>
          </div>
        </div>

        {/* Delivery Details */}
        {order?.address && (
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs sm:text-sm space-y-1">
            <p className="font-bold text-stone-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-orange-600" />
              Delivering to: {order.address.fullName} ({order.phone || order.address.phone})
            </p>
            <p className="text-stone-600 pl-5">
              {order.address.street}, {order.address.city} - {order.address.pincode}
            </p>
            <p className="text-stone-500 pl-5 pt-1">
              Payment: <strong>{order.paymentMethod}</strong> • Status:{' '}
              <span className="text-orange-600 font-bold">{order.orderStatus}</span>
            </p>
          </div>
        )}

        {/* Ordered items summary if available */}
        {order?.items && order.items.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Items in this Order
            </h4>
            <div className="divide-y divide-stone-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-stone-100"
                      />
                    )}
                    <div>
                      <p className="font-bold text-stone-800">{item.name}</p>
                      <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-stone-200 flex justify-between font-extrabold text-base text-stone-900">
              <span>Total Paid / Payable:</span>
              <span className="text-orange-600">₹{order.totalAmount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/my-orders"
          className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
        >
          <span>Track in My Orders</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/menu"
          className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold px-7 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Utensils className="w-4 h-4" />
          <span>Explore More Food</span>
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
