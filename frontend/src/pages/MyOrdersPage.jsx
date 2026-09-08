import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  MapPin,
  CheckCircle2,
  Package,
  Bike,
  Home,
  XCircle,
  AlertCircle,
  ShoppingBag,
  RotateCcw,
  Bell,
  Wifi,
  Sparkles,
  X,
} from 'lucide-react';
import api from '../services/api';
import { getSocket, onOrderStatusUpdated, onOrderCreated } from '../services/socket';
import { playNotificationChime } from '../utils/audioNotification';

const ORDER_STEPS = [
  { key: 'Pending', label: 'Order Placed', icon: Clock },
  { key: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'Preparing', label: 'Kitchen Preparing', icon: Package },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Bike },
  { key: 'Delivered', label: 'Delivered', icon: Home },
];

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [realtimeNotification, setRealtimeNotification] = useState(null);
  const [highlightedOrderId, setHighlightedOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/orders/my-orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err.message || 'Could not retrieve your orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Real-time WebSocket event listeners
  useEffect(() => {
    const socket = getSocket();
    setSocketConnected(socket.connected);

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Listen to real-time status updates pushed by the backend
    const unsubStatus = onOrderStatusUpdated((data) => {
      console.log('[MyOrders] Real-time order:status_updated received:', data);
      const targetId = data.orderId || data.order?.orderId;
      const targetMongoId = data.mongoId || data.order?._id;

      setOrders((prevOrders) => {
        const orderExists = prevOrders.some(
          (o) => o.orderId === targetId || o._id === targetMongoId
        );

        if (!orderExists) return prevOrders;

        return prevOrders.map((o) => {
          if (o.orderId === targetId || o._id === targetMongoId) {
            return {
              ...o,
              orderStatus: data.orderStatus || data.order?.orderStatus || o.orderStatus,
              paymentStatus: data.paymentStatus || data.order?.paymentStatus || o.paymentStatus,
            };
          }
          return o;
        });
      });

      // Show real-time notification alert banner
      setRealtimeNotification({
        orderId: targetId,
        status: data.orderStatus,
        message: data.message || `Order #${targetId} status changed to: ${data.orderStatus}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });

      // Highlight the updated order card with a glowing ring
      setHighlightedOrderId(targetId);
      setTimeout(() => setHighlightedOrderId(null), 6000);

      // Play soft chime notification
      playNotificationChime('status');
    });

    // Listen to new orders placed
    const unsubCreated = onOrderCreated((data) => {
      console.log('[MyOrders] Real-time order:created received:', data);
      if (data.order) {
        setOrders((prev) => {
          if (prev.some((o) => o.orderId === data.order.orderId || o._id === data.order._id)) {
            return prev;
          }
          return [data.order, ...prev];
        });
        playNotificationChime('new_order');
      }
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      unsubStatus();
      unsubCreated();
    };
  }, []);

  const handleCancelOrder = async (orderMongoId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      setCancellingId(orderMongoId);
      await api.put(`/orders/${orderMongoId}/status`, { status: 'Cancelled' });
      await fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusStepIndex = (status) => {
    return ORDER_STEPS.findIndex((s) => s.key === status);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Real-time floating alert banner if status updated */}
      {realtimeNotification && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-md">
                  Live Status Update
                </span>
                <span className="text-xs opacity-80">{realtimeNotification.timestamp}</span>
              </div>
              <p className="text-sm font-bold mt-0.5">{realtimeNotification.message}</p>
            </div>
          </div>
          <button
            onClick={() => setRealtimeNotification(null)}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Title & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              My Orders
            </h1>
            {/* Live WebSocket indicator */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                socketConnected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  socketConnected ? 'bg-emerald-500 animate-ping' : 'bg-stone-400'
                }`}
              />
              <span>{socketConnected ? 'Live Tracking Connected' : 'Connecting Stream...'}</span>
            </div>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Track real-time status and view details of your previous meals via instant WebSocket push.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-orange-600 bg-stone-100 px-3.5 py-2 rounded-xl transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Refresh Status
        </button>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-stone-200 space-y-4">
              <div className="h-6 bg-stone-200 rounded w-1/3"></div>
              <div className="h-16 bg-stone-100 rounded"></div>
              <div className="h-8 bg-stone-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <p className="text-sm font-bold text-rose-800">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200/80 p-8 space-y-4">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-stone-900">No Orders Placed Yet</h3>
          <p className="text-sm text-stone-500 max-w-sm mx-auto">
            When you order delicious food, your real-time tracking and order details will appear right here.
          </p>
          <div className="pt-2">
            <Link
              to="/menu"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all inline-block"
            >
              Order Food Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => {
            const currentStepIdx = getStatusStepIndex(order.orderStatus);
            const isCancelled = order.orderStatus === 'Cancelled';
            const isDelivered = order.orderStatus === 'Delivered';
            const isRecentlyUpdated = highlightedOrderId === order.orderId;

            return (
              <div
                key={order._id}
                className={`bg-white rounded-3xl border transition-all duration-500 overflow-hidden ${
                  isRecentlyUpdated
                    ? 'border-orange-500 ring-4 ring-orange-500/20 shadow-lg scale-[1.008]'
                    : 'border-stone-200/80 shadow-xs hover:border-stone-300'
                }`}
              >
                {/* Header */}
                <div className="p-6 bg-stone-50/70 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-stone-900 text-base">
                        {order.orderId}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                          isCancelled
                            ? 'bg-rose-100 text-rose-800'
                            : isDelivered
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {!isCancelled && !isDelivered && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                        )}
                        {order.orderStatus}
                      </span>
                      {isRecentlyUpdated && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md animate-pulse">
                          <Sparkles className="w-3 h-3" /> Just Updated
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-stone-400 block font-medium">Total Amount</span>
                    <span className="text-lg font-black text-stone-900">₹{order.totalAmount}</span>
                    <span className="text-xs text-stone-500 block">
                      {order.paymentMethod} • {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Progress Timeline */}
                <div className="p-6 border-b border-stone-100">
                  {isCancelled ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-700 text-sm">
                      <XCircle className="w-5 h-5 shrink-0" />
                      <span>This order was cancelled. Please place a new order from the menu.</span>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">
                        Live Tracking Timeline
                      </h4>
                      {/* Stepper bar */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {ORDER_STEPS.map((step, idx) => {
                          const Icon = step.icon;
                          const isDone = currentStepIdx >= idx;
                          const isCurrent = currentStepIdx === idx;

                          return (
                            <div
                              key={step.key}
                              className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                                isCurrent
                                  ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-500/20 shadow-xs'
                                  : isDone
                                  ? 'bg-emerald-50/60 border-emerald-200'
                                  : 'bg-stone-50 border-stone-200 opacity-60'
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ${
                                  isCurrent
                                    ? 'bg-orange-600 text-white'
                                    : isDone
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-stone-200 text-stone-500'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <span
                                className={`text-[11px] font-bold ${
                                  isCurrent
                                    ? 'text-orange-950'
                                    : isDone
                                    ? 'text-emerald-950'
                                    : 'text-stone-500'
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Items & Address Body */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Items list */}
                  <div className="md:col-span-7 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Dishes Ordered
                    </h4>
                    <div className="divide-y divide-stone-100">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-11 h-11 rounded-xl object-cover bg-stone-100 shrink-0"
                              />
                            )}
                            <div>
                              <p className="font-bold text-stone-900">{item.name}</p>
                              <p className="text-xs text-stone-500">
                                {item.quantity} × ₹{item.price}
                              </p>
                            </div>
                          </div>
                          <span className="font-extrabold text-stone-800">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address & Actions */}
                  <div className="md:col-span-5 bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs space-y-3">
                    <div>
                      <h4 className="font-bold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-600" />
                        Delivery Address
                      </h4>
                      <p className="font-bold text-stone-900">{order.address?.fullName}</p>
                      <p className="text-stone-600">{order.address?.street}</p>
                      <p className="text-stone-600">
                        {order.address?.city} - {order.address?.pincode}
                      </p>
                      <p className="text-stone-500 mt-1">Phone: {order.phone || order.address?.phone}</p>
                    </div>

                    {order.orderStatus === 'Pending' && (
                      <div className="pt-2 border-t border-stone-200">
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancellingId === order._id}
                          className="text-rose-600 hover:text-rose-800 font-bold hover:underline"
                        >
                          {cancellingId === order._id ? 'Cancelling...' : 'Cancel this Order'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
