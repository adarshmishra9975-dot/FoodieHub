import { io } from 'socket.io-client';

let socket = null;
let currentUserId = null;
let isAdmin = false;

/**
 * Get or initialize the singleton Socket.IO client
 */
export const getSocket = () => {
  if (!socket) {
    // In production or local dev with reverse proxy, connect to window.location.origin
    const socketUrl = window.location.origin;

    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      console.log(`[Socket] Connected to server (${socket.id})`);
      // Re-join user or admin rooms on reconnect
      if (currentUserId) {
        socket.emit('join:user', currentUserId);
      }
      if (isAdmin) {
        socket.emit('join:admin');
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected from server: ${reason}`);
    });

    socket.on('connect_error', (error) => {
      console.warn(`[Socket] Connection error:`, error.message);
    });
  }

  return socket;
};

/**
 * Register current authenticated user for room notifications
 * @param {string} userId - Mongo ID of user
 * @param {string} role - 'customer' or 'admin'
 */
export const registerUserSocket = (userId, role) => {
  const s = getSocket();
  currentUserId = userId;
  isAdmin = role === 'admin';

  if (s.connected) {
    if (userId) {
      s.emit('join:user', userId);
    }
    if (isAdmin) {
      s.emit('join:admin');
    }
  }
};

/**
 * Unregister on logout
 */
export const unregisterUserSocket = () => {
  currentUserId = null;
  isAdmin = false;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Subscribe to real-time order status updates
 * @param {Function} callback - ({ orderId, orderStatus, order, message }) => void
 * @returns {Function} cleanup unsubscribe function
 */
export const onOrderStatusUpdated = (callback) => {
  const s = getSocket();
  const handler = (data) => {
    callback(data);
  };

  s.on('order:status_updated', handler);
  return () => {
    s.off('order:status_updated', handler);
  };
};

/**
 * Subscribe to new order creation events (Admin & Customer)
 * @param {Function} callback - ({ orderId, order, message }) => void
 * @returns {Function} cleanup unsubscribe function
 */
export const onOrderCreated = (callback) => {
  const s = getSocket();
  const handler = (data) => {
    callback(data);
  };

  s.on('order:created', handler);
  return () => {
    s.off('order:created', handler);
  };
};

export default {
  getSocket,
  registerUserSocket,
  unregisterUserSocket,
  onOrderStatusUpdated,
  onOrderCreated,
};
