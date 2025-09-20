import { createContext, useContext, useReducer, useEffect } from 'react';
import apiClient from '../config/api.js';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  success: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_SUCCESS: 'SET_SUCCESS',
  CLEAR_SUCCESS: 'CLEAR_SUCCESS',
  SET_USER: 'SET_USER',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        success: action.payload.message,
      };
    
    case AUTH_ACTIONS.LOGOUT_SUCCESS:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        success: action.payload.message,
      };
    
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        success: null,
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    case AUTH_ACTIONS.SET_SUCCESS:
      return { ...state, success: action.payload, error: null };
    
    case AUTH_ACTIONS.CLEAR_SUCCESS:
      return { ...state, success: null };
    
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

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
    
    dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
    return errorMessage;
  };

  // Helper function to clear messages
  const clearMessages = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    dispatch({ type: AUTH_ACTIONS.CLEAR_SUCCESS });
  };

  // Signup function
  const signup = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      clearMessages();

      const response = await apiClient.post('/auth/signup', userData);
      
      if (response.data.success) {
        const { user } = response.data;
        // Tokens are now stored in HTTP-only cookies, only store user data
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, message: response.data.message }
        });
        
        return { success: true, user };
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Signup failed');
      return { success: false, error: errorMessage };
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      clearMessages();

      const response = await apiClient.post('/auth/login', credentials);
      
      if (response.data.success) {
        const { user } = response.data;
        // Tokens are now stored in HTTP-only cookies, only store user data
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, message: response.data.message }
        });
        
        return { success: true, user };
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Login failed');
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      clearMessages();

      await apiClient.post('/auth/logout');
      
      // Only clear user data, tokens are cleared by server via HTTP-only cookies
      localStorage.removeItem('user');
      
      dispatch({
        type: AUTH_ACTIONS.LOGOUT_SUCCESS,
        payload: { message: 'Logged out successfully' }
      });
      
      return { success: true };
    } catch (error) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem('user');
      
      dispatch({
        type: AUTH_ACTIONS.LOGOUT_SUCCESS,
        payload: { message: 'Logged out successfully' }
      });
      
      return { success: true };
    }
  };

  // Get user profile
  const getProfile = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      clearMessages();

      const response = await apiClient.get('/auth/profile');
      
      if (response.data.success) {
        const user = response.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
        return { success: true, user };
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to fetch profile');
      return { success: false, error: errorMessage };
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const response = await apiClient.post('/auth/refresh-token');
      
      if (response.data.success) {
        const { user } = response.data;
        // New access token is automatically set in HTTP-only cookie by server
        localStorage.setItem('user', JSON.stringify(user));
        
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
        return { success: true, user };
      }
    } catch (error) {
      // Refresh failed, logout user
      localStorage.removeItem('user');
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: null });
      return { success: false, error: 'Session expired' };
    }
  };

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const userData = localStorage.getItem('user');
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
          
          // Verify session is still valid by fetching profile
          // This will automatically use HTTP-only cookies for authentication
          await getProfile();
        } catch (error) {
          // Invalid data in localStorage or session expired, clear it
          localStorage.removeItem('user');
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: null });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Context value
  const value = {
    ...state,
    signup,
    login,
    logout,
    getProfile,
    refreshToken,
    clearMessages,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
