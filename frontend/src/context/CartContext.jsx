import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('foodiehub_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('foodiehub_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const addToCart = (food, quantity = 1) => {
    if (!food || !food._id) return;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => (item.food || item._id) === food._id
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        showNotification(`Updated "${food.name}" quantity to ${updated[existingIndex].quantity}`);
        return updated;
      } else {
        showNotification(`Added "${food.name}" to your cart!`);
        return [
          ...prevItems,
          {
            food: food._id,
            _id: food._id,
            name: food.name,
            price: Number(food.price),
            image: food.image,
            category: food.category,
            isVeg: food.isVeg,
            quantity: Number(quantity),
          },
        ];
      }
    });
  };

  const updateQuantity = (foodId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        const id = item.food || item._id;
        if (id === foodId) {
          return { ...item, quantity: Number(quantity) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (foodId) => {
    setCartItems((prevItems) => {
      const target = prevItems.find((item) => (item.food || item._id) === foodId);
      if (target) {
        showNotification(`Removed "${target.name}" from cart`);
      }
      return prevItems.filter((item) => (item.food || item._id) !== foodId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalCount = cartItems.reduce((acc, item) => acc + Number(item.quantity || 0), 0);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  // Delivery charge rule: ₹40, or free if subtotal >= 500
  const deliveryCharge = subtotal >= 500 || subtotal === 0 ? 0 : 40;

  const totalAmount = subtotal + deliveryCharge;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCount,
        subtotal,
        deliveryCharge,
        totalAmount,
        toastMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
