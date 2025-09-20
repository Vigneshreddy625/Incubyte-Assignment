import { createContext, useContext, useReducer, useCallback } from 'react';
import apiClient from '../config/api.js';

// Initial state
const initialState = {
  sweets: [],
  currentSweet: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  searchCriteria: {},
  isLoading: false,
  error: null,
  success: null,
};

// Action types
const SWEET_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_SWEETS: 'SET_SWEETS',
  SET_CURRENT_SWEET: 'SET_CURRENT_SWEET',
  ADD_SWEET: 'ADD_SWEET',
  UPDATE_SWEET: 'UPDATE_SWEET',
  REMOVE_SWEET: 'REMOVE_SWEET',
  SET_PAGINATION: 'SET_PAGINATION',
  SET_SEARCH_CRITERIA: 'SET_SEARCH_CRITERIA',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_SUCCESS: 'SET_SUCCESS',
  CLEAR_SUCCESS: 'CLEAR_SUCCESS',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
};

// Reducer function
const sweetReducer = (state, action) => {
  switch (action.type) {
    case SWEET_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case SWEET_ACTIONS.SET_SWEETS:
      return {
        ...state,
        sweets: action.payload.sweets,
        pagination: action.payload.pagination || state.pagination,
        isLoading: false,
        error: null,
      };
    
    case SWEET_ACTIONS.SET_CURRENT_SWEET:
      return { ...state, currentSweet: action.payload };
    
    case SWEET_ACTIONS.ADD_SWEET:
      return {
        ...state,
        sweets: [action.payload, ...state.sweets],
        success: 'Sweet created successfully',
        error: null,
        isLoading: false,
      };
    
    case SWEET_ACTIONS.UPDATE_SWEET:
      return {
        ...state,
        sweets: state.sweets.map(sweet => 
          sweet._id === action.payload._id ? action.payload : sweet
        ),
        currentSweet: state.currentSweet?._id === action.payload._id 
          ? action.payload 
          : state.currentSweet,
        success: 'Sweet updated successfully',
        error: null,
        isLoading: false,
      };
    
    case SWEET_ACTIONS.REMOVE_SWEET:
      return {
        ...state,
        sweets: state.sweets.filter(sweet => sweet._id !== action.payload),
        currentSweet: state.currentSweet?._id === action.payload 
          ? null 
          : state.currentSweet,
        success: 'Sweet deleted successfully',
        error: null,
        isLoading: false,
      };
    
    case SWEET_ACTIONS.SET_PAGINATION:
      return { ...state, pagination: action.payload };
    
    case SWEET_ACTIONS.SET_SEARCH_CRITERIA:
      return { ...state, searchCriteria: action.payload };
    
    case SWEET_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        success: null,
      };
    
    case SWEET_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    case SWEET_ACTIONS.SET_SUCCESS:
      return { ...state, success: action.payload, error: null };
    
    case SWEET_ACTIONS.CLEAR_SUCCESS:
      return { ...state, success: null };
    
    case SWEET_ACTIONS.CLEAR_MESSAGES:
      return { ...state, error: null, success: null };
    
    default:
      return state;
  }
};

// Create context
const SweetContext = createContext();

// Custom hook to use sweet context
export const useSweet = () => {
  const context = useContext(SweetContext);
  if (!context) {
    throw new Error('useSweet must be used within a SweetProvider');
  }
  return context;
};

// Sweet provider component
export const SweetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(sweetReducer, initialState);

  // Helper function to handle API errors
  const handleApiError = (error, defaultMessage = 'An error occurred') => {
    let errorMessage = defaultMessage;
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors) {
      // Handle validation errors
      errorMessage = Array.isArray(error.response.data.errors) 
        ? error.response.data.errors.join(', ')
        : error.response.data.errors;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    dispatch({ type: SWEET_ACTIONS.SET_ERROR, payload: errorMessage });
    return errorMessage;
  };

  // Helper function to clear messages
  const clearMessages = useCallback(() => {
    dispatch({ type: SWEET_ACTIONS.CLEAR_MESSAGES });
  }, [dispatch]);

  // Get all sweets with pagination
  const getAllSweets = useCallback(async (page = 1, limit = 10) => {
    try {
      dispatch({ type: SWEET_ACTIONS.SET_LOADING, payload: true });
      clearMessages();

      const response = await apiClient.get('/sweets', {
        params: { page, limit }
      });
      
      if (response.data.success) {
        const { sweets, pagination } = response.data.data;
        dispatch({
          type: SWEET_ACTIONS.SET_SWEETS,
          payload: { sweets, pagination }
        });
        return { success: true, sweets, pagination };
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch sweets');
      return { success: false, error: errorMessage };
    }
  }, [dispatch, clearMessages]);

  // Search sweets
  const searchSweets = async (searchParams = {}) => {
    try {
      dispatch({ type: SWEET_ACTIONS.SET_LOADING, payload: true });
      clearMessages();

      const response = await apiClient.get('/sweets/search', {
        params: searchParams
      });
      
      if (response.data.success) {
        const { sweets, pagination, searchCriteria } = response.data.data;
        dispatch({
          type: SWEET_ACTIONS.SET_SWEETS,
          payload: { sweets, pagination }
        });
        dispatch({
          type: SWEET_ACTIONS.SET_SEARCH_CRITERIA,
          payload: searchCriteria
        });
        return { success: true, sweets, pagination, searchCriteria };
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Search failed');
      return { success: false, error: errorMessage };
    }
  };

  // Create sweet (Admin only)
  const createSweet = async (sweetData) => {
    try {
      dispatch({ type: SWEET_ACTIONS.SET_LOADING, payload: true });
      clearMessages();

      const response = await apiClient.post('/sweets', sweetData);
      
      if (response.data.success) {
        const sweet = response.data.data;
        dispatch({ type: SWEET_ACTIONS.ADD_SWEET, payload: sweet });
        return { success: true, sweet };
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to create sweet');
      return { success: false, error: errorMessage };
    }
  };

  // Update sweet (Admin only)
  const updateSweet = async (id, updateData) => {
    try {
      dispatch({ type: SWEET_ACTIONS.SET_LOADING, payload: true });
      clearMessages();

      const response = await apiClient.patch(`/sweets/${id}`, updateData);
      
      if (response.data.success) {
        const sweet = response.data.data;
        dispatch({ type: SWEET_ACTIONS.UPDATE_SWEET, payload: sweet });
        return { success: true, sweet };
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to update sweet');
      return { success: false, error: errorMessage };
    }
  };

  // Delete sweet (Admin only)
  const deleteSweet = async (id) => {
    try {
      dispatch({ type: SWEET_ACTIONS.SET_LOADING, payload: true });
      clearMessages();

      const response = await apiClient.delete(`/sweets/${id}`);
      
      if (response.data.success) {
        dispatch({ type: SWEET_ACTIONS.REMOVE_SWEET, payload: id });
        return { success: true };
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to delete sweet');
      return { success: false, error: errorMessage };
    }
  };

  // Purchase sweet
  const purchaseSweet = async (id, quantity = 1) => {
    try {
      dispatch({ type: SWEET_ACTIONS.SET_LOADING, payload: true });
      clearMessages();

      const response = await apiClient.post(`/sweets/${id}/purchase`, { quantity });
      
      if (response.data.success) {
        const { sweet, purchasedQuantity, totalCost } = response.data.data;
        
        // Update the sweet in the list
        dispatch({ type: SWEET_ACTIONS.UPDATE_SWEET, payload: sweet });
        
        dispatch({
          type: SWEET_ACTIONS.SET_SUCCESS,
          payload: `Purchase successful! ${purchasedQuantity} units for $${totalCost}`
        });
        
        return { 
          success: true, 
          sweet, 
          purchasedQuantity, 
          totalCost 
        };
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Purchase failed');
      return { success: false, error: errorMessage };
    }
  };

  // Restock sweet (Admin only)
  const restockSweet = async (id, quantity) => {
    try {
      dispatch({ type: SWEET_ACTIONS.SET_LOADING, payload: true });
      clearMessages();

      const response = await apiClient.post(`/sweets/${id}/restock`, { quantity });
      
      if (response.data.success) {
        const { sweet, restockedQuantity, previousQuantity } = response.data.data;
        
        // Update the sweet in the list
        dispatch({ type: SWEET_ACTIONS.UPDATE_SWEET, payload: sweet });
        
        dispatch({
          type: SWEET_ACTIONS.SET_SUCCESS,
          payload: `Restocked successfully! Added ${restockedQuantity} units (${previousQuantity} → ${sweet.quantity})`
        });
        
        return { 
          success: true, 
          sweet, 
          restockedQuantity, 
          previousQuantity 
        };
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Restock failed');
      return { success: false, error: errorMessage };
    }
  };

  // Get sweet by ID
  const getSweetById = async (id) => {
    try {
      dispatch({ type: SWEET_ACTIONS.SET_LOADING, payload: true });
      clearMessages();

      // First check if sweet exists in current list
      const existingSweet = state.sweets.find(sweet => sweet._id === id);
      if (existingSweet) {
        dispatch({ type: SWEET_ACTIONS.SET_CURRENT_SWEET, payload: existingSweet });
        dispatch({ type: SWEET_ACTIONS.SET_LOADING, payload: false });
        return { success: true, sweet: existingSweet };
      }

      // If not found, fetch from server
      const response = await apiClient.get(`/sweets/${id}`);
      
      if (response.data.success) {
        const sweet = response.data.data;
        dispatch({ type: SWEET_ACTIONS.SET_CURRENT_SWEET, payload: sweet });
        return { success: true, sweet };
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch sweet');
      return { success: false, error: errorMessage };
    }
  };

  // Clear current sweet
  const clearCurrentSweet = () => {
    dispatch({ type: SWEET_ACTIONS.SET_CURRENT_SWEET, payload: null });
  };

  // Context value
  const value = {
    ...state,
    getAllSweets,
    searchSweets,
    createSweet,
    updateSweet,
    deleteSweet,
    purchaseSweet,
    restockSweet,
    getSweetById,
    clearCurrentSweet,
    clearMessages,
  };

  return (
    <SweetContext.Provider value={value}>
      {children}
    </SweetContext.Provider>
  );
};

export default SweetContext;
