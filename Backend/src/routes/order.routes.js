import express from 'express';
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/order.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply JWT verification to all routes
router.use(verifyJWT);

// User routes
router.post('/create', createOrder);
router.get('/my-orders', getUserOrders);
router.get('/:orderId', getOrderById);
router.patch('/:orderId/cancel', cancelOrder);

// Admin routes
router.get('/admin/all', isAdmin, getAllOrders);
router.patch('/admin/:orderId/status', isAdmin, updateOrderStatus);

export default router;
