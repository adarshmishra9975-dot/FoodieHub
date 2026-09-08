const Order = require('../models/Order');
const { emitOrderStatusUpdated, emitOrderCreated } = require('../utils/socket');

// Helper to generate a unique readable order identifier like FH-89421
const generateOrderId = () => {
  const timestampPart = Date.now().toString().slice(-4);
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `FH-${timestampPart}${randomPart}`;
};

// @desc    Create new customer order
// @route   POST /api/orders
// @access  Private (Customer & Admin)
const createOrder = async (req, res) => {
  try {
    const { items, address, phone, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty. Please add items to place an order.',
      });
    }

    if (!address || !address.fullName || !address.street || !address.city || !address.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all delivery address details (Name, Street, City, Pincode)',
      });
    }

    if (!phone && !address.phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid delivery contact phone number',
      });
    }

    // Calculate subtotal
    const subtotal = items.reduce((acc, item) => {
      return acc + Number(item.price) * Number(item.quantity);
    }, 0);

    // Delivery charge is ₹40, or free if subtotal is >= ₹500
    const deliveryCharge = subtotal >= 500 ? 0 : 40;
    const totalAmount = subtotal + deliveryCharge;

    const newOrderId = generateOrderId();

    const order = await Order.create({
      orderId: newOrderId,
      user: req.user._id,
      items: items.map((item) => ({
        food: item.food || item._id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image || '',
      })),
      totalAmount,
      deliveryCharge,
      address: {
        fullName: address.fullName,
        phone: address.phone || phone,
        street: address.street,
        city: address.city,
        pincode: address.pincode,
      },
      phone: phone || address.phone,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus: paymentMethod === 'Online Payment' ? 'Completed' : 'Pending',
      orderStatus: 'Pending',
    });

    // Populate user details for real-time broadcast to admin dashboard
    const populatedOrder = await Order.findById(order._id).populate('user', 'name email phone');

    // Trigger real-time WebSocket event
    try {
      emitOrderCreated(populatedOrder || order);
    } catch (wsErr) {
      console.warn('[WebSocket emit error on createOrder]', wsErr?.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Thank you for ordering with FoodieHub.',
      order: populatedOrder || order,
    });
  } catch (error) {
    console.error('[Create Order Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to place order. Please try again.',
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('[Get My Orders Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your order history',
    });
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    let order = await Order.findById(req.params.id).populate('user', 'name email phone');

    // Also support finding by orderId (e.g. FH-XXXX)
    if (!order) {
      order = await Order.findOne({ orderId: req.params.id }).populate('user', 'name email phone');
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify customer owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this order',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('[Get Order By ID Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order details',
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('[Get All Orders Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders list',
    });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    const validStatuses = [
      'Pending',
      'Confirmed',
      'Preparing',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed values: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found to update status',
      });
    }

    if (status) {
      order.orderStatus = status;
      // If delivered, mark payment as Completed for COD as well
      if (status === 'Delivered') {
        order.paymentStatus = 'Completed';
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    const updatedOrder = await order.save();

    // Populate user details for real-time notification
    const populatedOrder = await Order.findById(updatedOrder._id).populate('user', 'name email phone');

    // Trigger real-time WebSocket event
    try {
      emitOrderStatusUpdated(populatedOrder || updatedOrder);
    } catch (wsErr) {
      console.warn('[WebSocket emit error on updateOrderStatus]', wsErr?.message);
    }

    res.status(200).json({
      success: true,
      message: `Order status successfully updated to "${order.orderStatus}"`,
      order: populatedOrder || updatedOrder,
    });
  } catch (error) {
    console.error('[Update Order Status Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating order status',
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
