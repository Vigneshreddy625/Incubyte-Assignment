import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

const initialState = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.sweet._id === action.payload.sweet._id);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.sweet._id === action.payload.sweet._id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        return {
          ...state,
          items: updatedItems,
          totalAmount: updatedItems.reduce((total, item) => total + (item.sweet.price * item.quantity), 0),
          totalItems: updatedItems.reduce((total, item) => total + item.quantity, 0),
        };
      } else {
        const newItems = [...state.items, action.payload];
        return {
          ...state,
          items: newItems,
          totalAmount: newItems.reduce((total, item) => total + (item.sweet.price * item.quantity), 0),
          totalItems: newItems.reduce((total, item) => total + item.quantity, 0),
        };
      }

    case 'REMOVE_FROM_CART':
      const filteredItems = state.items.filter(item => item.sweet._id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        totalAmount: filteredItems.reduce((total, item) => total + (item.sweet.price * item.quantity), 0),
        totalItems: filteredItems.reduce((total, item) => total + item.quantity, 0),
      };

    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item =>
        item.sweet._id === action.payload.sweetId
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);
      
      return {
        ...state,
        items: updatedItems,
        totalAmount: updatedItems.reduce((total, item) => total + (item.sweet.price * item.quantity), 0),
        totalItems: updatedItems.reduce((total, item) => total + item.quantity, 0),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalAmount: 0,
        totalItems: 0,
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = (sweet, quantity = 1) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: { sweet, quantity },
    });
  };

  const removeFromCart = (sweetId) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: sweetId,
    });
  };

  const updateQuantity = (sweetId, quantity) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { sweetId, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
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
