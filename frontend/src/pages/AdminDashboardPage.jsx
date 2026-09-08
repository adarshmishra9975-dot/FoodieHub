import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Utensils,
  ShoppingBag,
  Users,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  X,
  AlertCircle,
  ExternalLink,
  Bell,
  Wifi,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket, onOrderStatusUpdated, onOrderCreated } from '../services/socket';
import { playNotificationChime } from '../utils/audioNotification';

const CATEGORIES = [

  'Pizza',
  'Burger',
  'Indian',
  'Chinese',
  'South Indian',
  'Snacks',
  'Desserts',
  'Beverages',
];

const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'foods' | 'orders' | 'users'

  // Data states
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalFoods: 0,
    totalUsers: 0,
    pendingOrdersCount: 0,
  });
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Real-time WebSocket states
  const [socketConnected, setSocketConnected] = useState(false);
  const [realtimeAlert, setRealtimeAlert] = useState(null);
  const [highlightedOrderId, setHighlightedOrderId] = useState(null);

  // Search & filter states
  const [foodSearch, setFoodSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [userSearch, setUserSearch] = useState('');

  // Food Form Modal State
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [foodFormData, setFoodFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Pizza',
    image: '',
    isVeg: true,
    rating: 4.5,
    ingredients: '',
    available: true,
  });

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      setActionError('');

      // Fetch in parallel
      const [foodsRes, ordersRes, usersRes] = await Promise.all([
        api.get('/foods'),
        api.get('/orders'),
        api.get('/users'),
      ]);

      const allFoods = foodsRes.data?.foods || [];
      const allOrders = ordersRes.data?.orders || [];
      const allUsers = usersRes.data?.users || [];

      setFoods(allFoods);
      setOrders(allOrders);
      setUsers(allUsers);

      // Compute statistics
      const validOrders = allOrders.filter((o) => o.orderStatus !== 'Cancelled');
      const sales = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const pendingCount = allOrders.filter((o) => o.orderStatus === 'Pending').length;

      setStats({
        totalSales: sales,
        totalOrders: allOrders.length,
        totalFoods: allFoods.length,
        totalUsers: allUsers.length,
        pendingOrdersCount: pendingCount,
      });
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
      setActionError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time WebSocket subscriptions for Admin
  useEffect(() => {
    const socket = getSocket();
    setSocketConnected(socket.connected);

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // 1. Real-time new order notification from customer
    const unsubCreated = onOrderCreated((data) => {
      console.log('[Admin Dashboard] Real-time order:created received:', data);
      if (data.order) {
        setOrders((prev) => {
          if (prev.some((o) => o.orderId === data.order.orderId || o._id === data.order._id)) {
            return prev;
          }
          return [data.order, ...prev];
        });

        // Dynamically update dashboard statistics
        setStats((prev) => ({
          ...prev,
          totalOrders: prev.totalOrders + 1,
          pendingOrdersCount: prev.pendingOrdersCount + 1,
          totalSales: prev.totalSales + (Number(data.order.totalAmount) || 0),
        }));

        setHighlightedOrderId(data.order.orderId);
        setTimeout(() => setHighlightedOrderId(null), 8000);

        setRealtimeAlert({
          type: 'new_order',
          orderId: data.order.orderId,
          amount: data.order.totalAmount,
          customer: data.order.user?.name || data.order.address?.fullName || 'Customer',
          message: data.message || `New Order Received: #${data.order.orderId} (₹${data.order.totalAmount})`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        });

        playNotificationChime('new_order');
      }
    });

    // 2. Real-time order status update notification
    const unsubStatus = onOrderStatusUpdated((data) => {
      console.log('[Admin Dashboard] Real-time order:status_updated received:', data);
      const targetId = data.orderId || data.order?.orderId;
      const targetMongoId = data.mongoId || data.order?._id;

      setOrders((prev) => {
        return prev.map((o) => {
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

      // Recalculate pending count
      setStats((prev) => {
        const isNowPending = data.orderStatus === 'Pending';
        return {
          ...prev,
          pendingOrdersCount: Math.max(0, prev.pendingOrdersCount + (isNowPending ? 1 : -1)),
        };
      });

      setHighlightedOrderId(targetId);
      setTimeout(() => setHighlightedOrderId(null), 6000);

      setRealtimeAlert({
        type: 'status_updated',
        orderId: targetId,
        status: data.orderStatus,
        message: data.message || `Order #${targetId} status updated to "${data.orderStatus}"`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });

      playNotificationChime('status');
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      unsubCreated();
      unsubStatus();
    };
  }, []);

  // Food CRUD Handlers
  const handleOpenAddFoodModal = () => {
    setEditingFoodId(null);
    setFoodFormData({
      name: '',
      description: '',
      price: '',
      category: 'Pizza',
      image: '',
      isVeg: true,
      rating: 4.5,
      ingredients: '',
      available: true,
    });
    setIsFoodModalOpen(true);
  };

  const handleOpenEditFoodModal = (food) => {
    setEditingFoodId(food._id);
    setFoodFormData({
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category,
      image: food.image,
      isVeg: food.isVeg,
      rating: food.rating || 4.5,
      ingredients: Array.isArray(food.ingredients) ? food.ingredients.join(', ') : '',
      available: food.available !== false,
    });
    setIsFoodModalOpen(true);
  };

  const handleSaveFood = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    try {
      const payload = {
        name: foodFormData.name.trim(),
        description: foodFormData.description.trim(),
        price: Number(foodFormData.price),
        category: foodFormData.category,
        image: foodFormData.image.trim(),
        isVeg: Boolean(foodFormData.isVeg),
        rating: Number(foodFormData.rating),
        ingredients: foodFormData.ingredients
          ? foodFormData.ingredients.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        available: Boolean(foodFormData.available),
      };

      if (editingFoodId) {
        await api.put(`/foods/${editingFoodId}`, payload);
        setActionSuccess('Dish updated successfully!');
      } else {
        await api.post('/foods', payload);
        setActionSuccess('New dish added to menu!');
      }

      setIsFoodModalOpen(false);
      fetchData();
    } catch (err) {
      setActionError(err.message || 'Failed to save food dish');
    }
  };

  const handleDeleteFood = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the menu?`)) return;

    try {
      await api.delete(`/foods/${id}`);
      setActionSuccess(`"${name}" was deleted successfully.`);
      fetchData();
    } catch (err) {
      setActionError(err.message || 'Failed to delete dish');
    }
  };

  // Order status update handler
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setActionSuccess(`Order status changed to ${newStatus}`);
      fetchData();
    } catch (err) {
      setActionError(err.message || 'Failed to update order status');
    }
  };

  // Filtered lists
  const filteredFoods = foods.filter(
    (f) =>
      f.name.toLowerCase().includes(foodSearch.toLowerCase()) ||
      f.category.toLowerCase().includes(foodSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'All') return true;
    return o.orderStatus === orderStatusFilter;
  });

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Admin Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
              Administrator Portal
            </span>
            <span className="text-xs text-stone-400">Authenticated: {user?.email}</span>
            {/* Live WebSocket indicator */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
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
              <span>{socketConnected ? 'Live Order Stream Active' : 'Connecting Stream...'}</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
            FoodieHub Admin Management
          </h1>
        </div>

        <button
          onClick={fetchData}
          className="self-start sm:self-auto inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Real-time Order Alert Banner */}
      {realtimeAlert && (
        <div
          className={`text-white rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300 ${
            realtimeAlert.type === 'new_order'
              ? 'bg-gradient-to-r from-orange-600 to-amber-600'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-md">
                  {realtimeAlert.type === 'new_order' ? 'New Incoming Order' : 'Order Status Update'}
                </span>
                <span className="text-xs opacity-80">{realtimeAlert.timestamp}</span>
              </div>
              <p className="text-sm font-bold mt-0.5">{realtimeAlert.message}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {activeTab !== 'orders' && (
              <button
                onClick={() => {
                  setActiveTab('orders');
                  setRealtimeAlert(null);
                }}
                className="bg-white text-stone-900 hover:bg-stone-100 font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors"
              >
                View in Orders Tab
              </button>
            )}
            <button
              onClick={() => setRealtimeAlert(null)}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Alert Banners */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')}>
            <X className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')}>
            <X className="w-4 h-4 text-rose-600" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-stone-200 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'overview'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard Overview
        </button>

        <button
          onClick={() => setActiveTab('foods')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'foods'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Utensils className="w-4 h-4" />
          Food Items ({foods.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'orders'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Orders ({orders.length})
          {stats.pendingOrdersCount > 0 && (
            <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {stats.pendingOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'users'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Registered Users ({users.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Total Revenue
                </span>
                <p className="text-2xl font-black text-stone-900 mt-1">₹{stats.totalSales}</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Excludes cancelled orders</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Total Orders
                </span>
                <p className="text-2xl font-black text-stone-900 mt-1">{stats.totalOrders}</p>
                <p className="text-[11px] text-orange-600 font-semibold mt-0.5">
                  {stats.pendingOrdersCount} awaiting confirmation
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Dishes on Menu
                </span>
                <p className="text-2xl font-black text-stone-900 mt-1">{stats.totalFoods}</p>
                <p className="text-[11px] text-stone-500 font-semibold mt-0.5">Across 8 food categories</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl">
                <Utensils className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Customers & Staff
                </span>
                <p className="text-2xl font-black text-stone-900 mt-1">{stats.totalUsers}</p>
                <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Role-based accounts</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-lg font-bold text-stone-900">Recent Customer Orders</h2>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-orange-600 hover:underline"
              >
                View All Orders →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 text-xs uppercase">
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Dishes</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order._id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-stone-900">
                        {order.orderId}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-stone-800">{order.user?.name || order.address?.fullName}</p>
                        <p className="text-xs text-stone-400">{order.phone || order.address?.phone}</p>
                      </td>
                      <td className="py-3 px-3 text-stone-600">
                        {order.items?.length} item(s)
                      </td>
                      <td className="py-3 px-3 font-black text-stone-900">₹{order.totalAmount}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.orderStatus === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                          className="bg-stone-50 border border-stone-200 text-xs rounded-lg px-2 py-1 font-semibold text-stone-700"
                        >
                          {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FOOD MENU MANAGEMENT */}
      {activeTab === 'foods' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <input
                type="text"
                placeholder="Search dish by name or category..."
                value={foodSearch}
                onChange={(e) => setFoodSearch(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>

            <button
              onClick={handleOpenAddFoodModal}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-400 text-xs uppercase">
                    <th className="py-3 px-4">Dish</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredFoods.map((food) => (
                    <tr key={food._id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={food.image}
                            alt={food.name}
                            className="w-12 h-12 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200"
                          />
                          <div>
                            <p className="font-bold text-stone-900">{food.name}</p>
                            <p className="text-xs text-stone-400 line-clamp-1 max-w-xs">
                              {food.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-stone-100 text-stone-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                          {food.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            food.isVeg
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {food.isVeg ? 'Veg' : 'Non-Veg'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-stone-900">₹{food.price}</td>
                      <td className="py-3 px-4 font-bold text-amber-600">★ {food.rating}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            food.available !== false
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {food.available !== false ? 'In Stock' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditFoodModal(food)}
                            className="p-1.5 text-stone-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Edit dish"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFood(food._id, food.name)}
                            className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete dish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Status Filter tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', ...ORDER_STATUSES].map((status) => (
              <button
                key={status}
                onClick={() => setOrderStatusFilter(status)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  orderStatusFilter === status
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center text-stone-500 border border-stone-200">
                No orders match the selected filter.
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isRecentlyUpdated = highlightedOrderId === order.orderId;

                return (
                  <div
                    key={order._id}
                    className={`bg-white rounded-3xl p-6 border transition-all duration-500 shadow-xs space-y-4 ${
                      isRecentlyUpdated
                        ? 'border-orange-500 ring-4 ring-orange-500/20 shadow-lg scale-[1.008]'
                        : 'border-stone-200/80 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-stone-900">{order.orderId}</span>
                          {isRecentlyUpdated && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md animate-pulse">
                              <Sparkles className="w-3 h-3" /> Live Event
                            </span>
                          )}
                          <span className="text-xs text-stone-400">
                            •{' '}
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Customer: <strong>{order.user?.name || order.address?.fullName}</strong> ({order.phone || order.address?.phone})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-stone-400 block">Total</span>
                        <span className="text-base font-black text-stone-900">₹{order.totalAmount}</span>
                      </div>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-orange-500"
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
                    <div className="sm:col-span-8">
                      <h4 className="font-bold text-stone-500 uppercase tracking-wider mb-2">
                        Dishes Ordered:
                      </h4>
                      <div className="space-y-1.5">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-stone-700">
                            <span>
                              • {item.name} × <strong>{item.quantity}</strong>
                            </span>
                            <span className="font-semibold">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="sm:col-span-4 bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <h4 className="font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Shipping Address
                      </h4>
                      <p className="text-stone-600">{order.address?.street}</p>
                      <p className="text-stone-600">
                        {order.address?.city} - {order.address?.pincode}
                      </p>
                      <p className="text-stone-500 mt-1 font-medium">Payment: {order.paymentMethod}</p>
                    </div>
                  </div>
                </div>
              );
            })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="relative max-w-sm">
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          </div>

          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-400 text-xs uppercase">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Address</th>
                    <th className="py-3 px-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-stone-50/50">
                      <td className="py-3 px-4 font-bold text-stone-900">{u.name}</td>
                      <td className="py-3 px-4 text-stone-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-600">{u.phone || '—'}</td>
                      <td className="py-3 px-4 text-stone-500 text-xs max-w-xs truncate">
                        {u.address || '—'}
                      </td>
                      <td className="py-3 px-4 text-xs text-stone-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT FOOD MODAL */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-xl font-extrabold text-stone-900">
                {editingFoodId ? 'Edit Food Dish' : 'Add New Food Dish'}
              </h3>
              <button
                onClick={() => setIsFoodModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFood} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  value={foodFormData.name}
                  onChange={(e) => setFoodFormData({ ...foodFormData, name: e.target.value })}
                  placeholder="e.g. Gourmet Truffle Pizza"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={foodFormData.category}
                    onChange={(e) => setFoodFormData({ ...foodFormData, category: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={foodFormData.price}
                    onChange={(e) => setFoodFormData({ ...foodFormData, price: e.target.value })}
                    placeholder="e.g. 299"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={foodFormData.image}
                  onChange={(e) => setFoodFormData({ ...foodFormData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={foodFormData.description}
                  onChange={(e) => setFoodFormData({ ...foodFormData, description: e.target.value })}
                  placeholder="Freshly prepared with mozzarella, marinara, and basil..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Ingredients (Comma separated)
                </label>
                <input
                  type="text"
                  value={foodFormData.ingredients}
                  onChange={(e) => setFoodFormData({ ...foodFormData, ingredients: e.target.value })}
                  placeholder="e.g. Mozzarella, Basil, Olive Oil, Garlic"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={foodFormData.isVeg}
                    onChange={(e) => setFoodFormData({ ...foodFormData, isVeg: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-sm font-semibold text-stone-800">Pure Vegetarian Dish</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={foodFormData.available}
                    onChange={(e) => setFoodFormData({ ...foodFormData, available: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <span className="text-sm font-semibold text-stone-800">Available in Stock</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsFoodModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md transition-all"
                >
                  {editingFoodId ? 'Save Changes' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
