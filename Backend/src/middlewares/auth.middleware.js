import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js'; 

export const protect = async (req, res, next) => {
  // First try to get token from cookie (HTTP-only)
  let token = req.cookies?.accessToken;
  
  // Fallback to Authorization header for backward compatibility
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = await User.findById(decoded._id).select('-password -refreshToken');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found. Invalid token.' });
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token signature.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    }
    console.error('Auth middleware error:', error);
    next(error); 
  }
};

export const admin = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Not authorized as an admin.' });
};

export const verifyJWT = protect;
export const isAdmin = admin;