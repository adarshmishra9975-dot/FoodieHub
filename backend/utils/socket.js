const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.IO with the HTTP Server
 * @param {import('http').Server} httpServer
 */
const initSocket = (httpServer) => {
  if (io) return io;

  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Customer joins their personal room to receive their order updates
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[WebSocket] Socket ${socket.id} joined room user:${userId}`);
      }
    });

    // Admin joins admin room to receive all new orders & updates
    socket.on('join:admin', () => {
      socket.join('admin');
      console.log(`[WebSocket] Socket ${socket.id} joined room admin`);
    });

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  console.log('[WebSocket] Socket.IO server initialized successfully');
  return io;
};

/**
 * Get active Socket.IO server instance
 */
const getIO = () => {
  return io;
};

/**
 * Emit real-time status update for an order
 * @param {Object} order - Updated Mongoose order document
 */
const emitOrderStatusUpdated = (order) => {
  if (!io) {
    console.warn('[WebSocket] Warning: io instance not initialized yet');
    return;
  }

  const payload = {
    orderId: order.orderId,
    mongoId: order._id,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    order,
    updatedAt: new Date().toISOString(),
    message: `Order #${order.orderId} status updated to: "${order.orderStatus}"`,
  };

  console.log(`[WebSocket] Emitting order:status_updated for #${order.orderId} -> ${order.orderStatus}`);

  // 1. Broadcast to specific customer's room
  if (order.user) {
    const userId = order.user._id ? order.user._id.toString() : order.user.toString();
    io.to(`user:${userId}`).emit('order:status_updated', payload);
  }

  // 2. Broadcast to all admins
  io.to('admin').emit('order:status_updated', payload);

  // 3. General broadcast so any customer viewing order details updates immediately
  io.emit('order:status_updated', payload);
};

/**
 * Emit real-time notification for a newly created order
 * @param {Object} order - Created Mongoose order document
 */
const emitOrderCreated = (order) => {
  if (!io) {
    console.warn('[WebSocket] Warning: io instance not initialized yet');
    return;
  }

  const payload = {
    orderId: order.orderId,
    mongoId: order._id,
    order,
    createdAt: new Date().toISOString(),
    message: `New order placed: #${order.orderId} (₹${order.totalAmount})`,
  };

  console.log(`[WebSocket] Emitting order:created for #${order.orderId}`);

  // Broadcast to all admins
  io.to('admin').emit('order:created', payload);

  // Broadcast to customer
  if (order.user) {
    const userId = order.user._id ? order.user._id.toString() : order.user.toString();
    io.to(`user:${userId}`).emit('order:created', payload);
  }

  // Also emit generally
  io.emit('order:created', payload);
};

module.exports = {
  initSocket,
  getIO,
  emitOrderStatusUpdated,
  emitOrderCreated,
};
