# FoodieHub – Food Ordering System 🍔🍕

> A modern, responsive, and full-stack Food Ordering System built with React, Node.js, Express, and MongoDB. Tailored specifically for academic excellence and viva demonstration (BSc IT Capstone Project).

---

## 📌 Project Overview

**FoodieHub** is an intuitive food delivery web application that connects customers with a curated menu of pizzas, burgers, Indian curries, Chinese wok specials, South Indian breakfast, snacks, and desserts. The platform features role-based access control, a seamless shopping cart with real-time bill breakdown, order placement with live tracking timeline, and an administrative dashboard for food, order, and user management.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React.js (v18+) with Vite
- **Language:** JavaScript (ES6+)
- **Routing:** React Router DOM (v7)
- **State Management:** React Context API (`AuthContext`, `CartContext`)
- **HTTP Client:** Axios (with automated bearer token authorization interceptors)
- **Real-Time Client:** Socket.IO Client (`socket.io-client`)
- **Audio Feedback:** Web Audio API sound generator (no external audio assets required)
- **Styling:** Modern Tailwind CSS with responsive design
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Server Framework:** Express.js
- **Real-Time Engine:** Socket.IO Server (bidirectional WebSocket transport)
- **Architecture:** RESTful API with MVC pattern (Models, Controllers, Routes, Middleware)
- **Authentication:** JSON Web Tokens (JWT) with HTTP Authorization headers
- **Password Security:** `bcryptjs` salted hashing
- **Database ODM:** Mongoose

### Database
- **Database Engine:** MongoDB (Local MongoDB Compass compatible)
- **Local Fallback:** In-memory MongoDB engine (`mongodb-memory-server`) pre-configured so the application boots instantly in cloud sandboxes without requiring external Atlas clusters.

---

## ✨ Key Features

### 👤 Customer Features
1. **Interactive Homepage:**
   - Hero banner with quick food search and category exploration.
   - Popular dishes showcase loaded dynamically from MongoDB.
   - Special deals, discount coupons, and why-choose-us highlights.
2. **Food Menu & Filtering:**
   - Search by dish name, description, or ingredients.
   - Category filtering (Pizza, Burger, Indian, Chinese, South Indian, Snacks, Desserts, Beverages).
   - Dietary toggle (All / Pure Veg / Non-Veg).
   - Price sorting (Low to High, High to Low) and Rating sorting.
3. **Dish Details Page:**
   - High-resolution dish imagery, ingredients tag list, pricing, and availability status.
   - Quantity selector and related dishes in the same category.
4. **Shopping Cart Management:**
   - Add dishes, increment/decrement quantities, remove individual items, or clear cart.
   - Dynamic bill calculation: Subtotal, Delivery Fee (FREE above ₹500), and Grand Total.
   - LocalStorage synchronization to preserve items across page reloads.
5. **Checkout & Order Placement:**
   - Delivery address collection with auto-fill from user profile.
   - Cash on Delivery (COD) and Online Payment gateway simulation.
   - Immediate order generation with unique ID (e.g. `FH-74921`).
6. **Order Tracking & Real-Time Updates (WebSockets):**
   - Real-time 5-stage timeline: `Order Placed` ➔ `Confirmed` ➔ `Kitchen Preparing` ➔ `Out for Delivery` ➔ `Delivered`.
   - **Instant Push:** When the admin updates order status, the customer's "My Orders" screen updates immediately without page reload.
   - **Visual & Audio Cues:** Live floating update alerts, glowing card highlights, and gentle Web Audio chimes.
   - Order cancellation support for pending orders.
7. **User Profile:**
   - Edit personal name, contact phone, default delivery address, and update password.

### 👑 Admin Management Features
1. **Analytics Dashboard:**
   - Real-time metrics: Total Sales Revenue (₹), Total Orders count, Active Menu items, and Registered Users.
   - Dynamically recalculates totals when new orders arrive via WebSocket.
2. **Real-Time Order Ingestion & Live Alerts:**
   - Immediate audio-visual chime and top banner when any customer places a new order.
   - Live stream indicator badge (`🟢 Live Order Stream Active`).
3. **Food Menu CRUD:**
   - Add new dishes with image URL, price, category, veg/non-veg flag, and ingredients.
   - Edit existing dish parameters in real time.
   - Remove dishes from the menu.
   - Toggle item availability in stock.
4. **Order Management:**
   - View orders from all platform users with complete line-item breakdown.
   - Update order progression status (`Pending`, `Confirmed`, `Preparing`, `Out for Delivery`, `Delivered`, `Cancelled`).
   - Filter orders by status.
5. **User Directory:**
   - View all registered customers and administrators with role badges and registration dates.

---

## ⚡ Real-Time WebSocket Architecture (Socket.IO)

The application incorporates a lightweight, production-ready WebSocket architecture using Socket.IO:

1. **Room-Based Isolation:**
   - **Admin Room (`admin`):** Authenticated administrators automatically join the `admin` room to receive broadcasts of incoming orders and global status changes.
   - **Customer Room (`user:<userId>`):** Customers join their private room on login. Status transitions for an order are pushed specifically to the customer who placed the order.

2. **Socket Events:**
   - `register`: Sent by client on login with `{ userId, role }` to route socket into appropriate rooms.
   - `order:created`: Emitted by server when a customer creates an order. Delivered instantly to `admin` room with new order payload.
   - `order:status_updated`: Emitted by server when an order's status changes. Delivered to both the specific customer's room and the `admin` room.

3. **Client-Side Synchronization:**
   - Local state in `MyOrdersPage` and `AdminDashboardPage` updates seamlessly in-memory without causing full-page re-renders or losing user scroll position.
   - Non-intrusive notification sounds generated via synthetic Web Audio API frequencies.

---

## 🔑 Default Credentials (Pre-seeded)

The database automatically seeds default demo accounts on first launch:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@foodiehub.com` | `Admin@123` | Full access to Admin Dashboard, Food CRUD, Orders & Users |
| **Customer** | `customer@foodiehub.com` | `Customer@123` | Ordering food, tracking deliveries, managing profile |

*(One-click autofill buttons are also provided on the Login page for convenience).*

---

## 📁 Directory Structure

```
FoodieHub/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic (local Compass & fallback)
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile retrieval
│   │   ├── foodController.js     # Food CRUD and query filtering
│   │   ├── orderController.js    # Order creation, status transitions, user history
│   │   └── userController.js     # User listing and profile updates
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT token verification
│   │   └── adminMiddleware.js    # Administrator role guard
│   ├── models/
│   │   ├── User.js               # Mongoose schema for User
│   │   ├── Food.js               # Mongoose schema for Food Item
│   │   └── Order.js              # Mongoose schema for Order & delivery address
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── foodRoutes.js         # /api/foods routes
│   │   ├── orderRoutes.js        # /api/orders routes
│   │   └── userRoutes.js         # /api/users routes
│   ├── utils/
│   │   └── seed.js               # Sample dishes, admin, and demo customer seed data
│   ├── .env                      # Backend environment variables
│   └── server.js                 # Express application entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Sticky navigation with cart badge & auth menu
│   │   │   ├── Footer.jsx        # Informative multi-column footer
│   │   │   ├── FoodCard.jsx      # Reusable food card with veg indicator & cart controls
│   │   │   ├── ProtectedRoute.jsx# Auth & role-based route guard
│   │   │   └── Toast.jsx         # Non-intrusive floating feedback alerts
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Global user login state & token storage
│   │   │   └── CartContext.jsx   # Global cart operations & price calculation
│   │   ├── pages/
│   │   │   ├── HomePage.jsx      # Landing page, categories, popular dishes, specials
│   │   │   ├── MenuPage.jsx      # Filterable & searchable food menu
│   │   │   ├── FoodDetailPage.jsx# Single dish details with ingredients & quantity
│   │   │   ├── CartPage.jsx      # Bill summary and item modifications
│   │   │   ├── CheckoutPage.jsx  # Address collection & payment method selection
│   │   │   ├── OrderSuccessPage.jsx# Order confirmation receipt
│   │   │   ├── MyOrdersPage.jsx  # Order tracking timeline & order history
│   │   │   ├── ProfilePage.jsx   # Customer account settings
│   │   │   ├── LoginPage.jsx     # Login with demo account autofill
│   │   │   ├── RegisterPage.jsx  # Customer registration
│   │   │   ├── AboutPage.jsx     # Project overview & mission
│   │   │   ├── ContactPage.jsx   # Contact details & inquiry form
│   │   │   └── AdminDashboardPage.jsx # Full Admin portal for dishes, orders, and users
│   │   ├── services/
│   │   │   └── api.js            # Axios client with request/response interceptors
│   │   └── App.jsx               # React Router DOM page configuration
│   ├── index.html
│   └── package.json
├── metadata.json
├── package.json
└── README.md
```

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) and [MongoDB Compass](https://www.mongodb.com/products/tools/compass) (optional if running locally)

### 2. Clone or Extract Project
```bash
cd FoodieHub
```

### 3. Install Dependencies
Install root project dependencies:
```bash
npm install
```

### 4. Configure Environment Variables
A sample `.env` file is located in `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/foodiehub
JWT_SECRET=foodiehub_super_secret_jwt_key_2026_bsc_it
NODE_ENV=development
```
*Note: If MongoDB Compass is running on `mongodb://127.0.0.1:27017/foodiehub`, data will persist directly in your local Compass database. If MongoDB is not active locally, the built-in in-memory engine will automatically handle queries without crashing.*

### 5. Seed Initial Data
Seed the database with sample dishes and accounts:
```bash
npm run seed
```

### 6. Run the Application
Start the unified full-stack server (Frontend + Backend on Port 3000):
```bash
npm run dev
```
Open your browser and navigate to:
`http://localhost:3000`

---

## 🌐 REST API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new customer
- `POST /api/auth/login` — Login user & return JWT token
- `GET /api/auth/me` — Retrieve current authenticated profile (Protected)

### 🍕 Foods (`/api/foods`)
- `GET /api/foods` — Get all foods (Supports `?category=`, `?search=`, `?isVeg=`, `?sort=`)
- `GET /api/foods/:id` — Get single food item by ID
- `POST /api/foods` — Create new food item (Admin only)
- `PUT /api/foods/:id` — Update food item (Admin only)
- `DELETE /api/foods/:id` — Delete food item (Admin only)

### 📦 Orders (`/api/orders`)
- `POST /api/orders` — Create a new order (Protected)
- `GET /api/orders/my-orders` — Get orders belonging to logged-in user (Protected)
- `GET /api/orders/:id` — Get single order details (Protected)
- `GET /api/orders` — Get all orders across platform (Admin only)
- `PUT /api/orders/:id/status` — Update order status (Admin or customer cancellation)

### 👥 Users (`/api/users`)
- `GET /api/users` — Get all registered users (Admin only)
- `GET /api/users/:id` — Get user by ID (Admin or owner)
- `PUT /api/users/:id` — Update user details (Admin or owner)

---

## 🎓 Viva & Academic Presentation Tips
- **Role Separation:** Explain how `adminMiddleware.js` checks `req.user.role === 'admin'` before allowing administrative actions.
- **Cart Calculations:** Demonstrate that subtotal and free shipping thresholds are computed both client-side for immediate UI feedback and verified server-side in `orderController.js` for security.
- **Token Handling:** Explain how JWT tokens are issued on login and attached via Axios request interceptor (`Authorization: Bearer <token>`).

---

© 2026 FoodieHub – Developed for BSc IT Capstone Evaluation.
