import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiClient from '../config/api';

const OrderContext = createContext();

const initialState = {
  orders: [],
  userOrders: [],
  loading: false,
  error: null,
  totalOrders: 0,
  currentPage: 1,
  totalPages: 1,
};

const orderReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_ORDERS':
      return {
        ...state,
        orders: action.payload.orders,
        totalOrders: action.payload.totalOrders,
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages,
        loading: false,
        error: null,
      };
    case 'SET_USER_ORDERS':
      return {
        ...state,
        userOrders: action.payload.orders,
        totalOrders: action.payload.totalOrders,
        currentPage: action.payload.currentPage,
        totalPages: action.payload.totalPages,
        loading: false,
        error: null,
      };
    case 'ADD_ORDER':
      return {
        ...state,
        userOrders: [action.payload, ...state.userOrders],
        totalOrders: state.totalOrders + 1,
      };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(order =>
          order._id === action.payload._id ? action.payload : order
        ),
        userOrders: state.userOrders.map(order =>
          order._id === action.payload._id ? action.payload : order
        ),
      };
    case 'CANCEL_ORDER':
      return {
        ...state,
        userOrders: state.userOrders.map(order =>
          order._id === action.payload._id ? action.payload : order
        ),
      };
    default:
      return state;
  }
};

export const OrderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  // Create order
  const createOrder = async (orderData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiClient.post('/orders/create', orderData);
      
      if (response.data.success) {
        dispatch({ type: 'ADD_ORDER', payload: response.data.data });
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create order');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create order';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Get user orders
  const getUserOrders = async (page = 1, limit = 10, status = null) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);

      const response = await apiClient.get(`/orders/my-orders?${params}`);
      
      if (response.data.success) {
        dispatch({ type: 'SET_USER_ORDERS', payload: response.data.data });
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch orders';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Get all orders (Admin)
  const getAllOrders = async (page = 1, limit = 10, status = null, userId = null) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);
      if (userId) params.append('userId', userId);

      const response = await apiClient.get(`/orders/admin/all?${params}`);
      
      if (response.data.success) {
        dispatch({ type: 'SET_ORDERS', payload: response.data.data });
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch orders';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Get order by ID
  const getOrderById = async (orderId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiClient.get(`/orders/${orderId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch order');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch order';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Update order status (Admin)
  const updateOrderStatus = async (orderId, statusData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiClient.patch(`/orders/admin/${orderId}/status`, statusData);
      
      if (response.data.success) {
        dispatch({ type: 'UPDATE_ORDER', payload: response.data.data });
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update order status');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update order status';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Cancel order
  const cancelOrder = async (orderId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiClient.patch(`/orders/${orderId}/cancel`);
      
      if (response.data.success) {
        dispatch({ type: 'CANCEL_ORDER', payload: response.data.data });
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to cancel order');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel order';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    createOrder,
    getUserOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    clearError,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
