import { Order } from '../models/order.model.js';
import { Sweet } from '../models/sweet.model.js';
import { sendApiResponse } from '../utils/ApiResponse.js';
import { sendApiError } from '../utils/ApiError.js';
import mongoose from 'mongoose';

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    const userId = req.user._id;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new sendApiError(400, 'Order items are required');
    }

    // Validate shipping address
    if (!shippingAddress) {
      throw new sendApiError(400, 'Shipping address is required');
    }

    const requiredAddressFields = ['street', 'city', 'state', 'zipCode'];
    for (const field of requiredAddressFields) {
      if (!shippingAddress[field]) {
        throw new sendApiError(400, `${field} is required in shipping address`);
      }
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const { sweetId, quantity } = item;

      if (!sweetId || !quantity || quantity < 1) {
        throw new sendApiError(400, 'Invalid item data');
      }

      const sweet = await Sweet.findById(sweetId);
      if (!sweet) {
        throw new sendApiError(404, `Sweet with ID ${sweetId} not found`);
      }

      if (sweet.quantity < quantity) {
        throw new sendApiError(
          400,
          `Insufficient stock for ${sweet.name}. Available: ${sweet.quantity}`
        );
      }

      const itemTotal = sweet.price * quantity;
      totalAmount += itemTotal;

      orderItems.push({
        sweet: sweetId,
        quantity,
        price: sweet.price,
      });
    }

    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'cash_on_delivery',
      notes,
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'fullName email')
      .populate('items.sweet', 'name category price');

    return sendApiResponse(res, 201, 'Order created successfully', populatedOrder);
  } catch (error) {
    console.error('Create order error:', error);
    if (error instanceof sendApiError) {
      return res.status(error.statusCode).json(error);
    }
    return sendApiError(res, 500, 'Internal server error');
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: userId };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('items.sweet', 'name category price')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Order.countDocuments(query);

    return sendApiResponse(res, 200, 'Orders retrieved successfully', {
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      totalOrders: total,
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    return sendApiError(res, 500, 'Internal server error');
  }
};

// Get all orders (Admin only)
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (userId) query.user = userId;

    const orders = await Order.find(query)
      .populate('user', 'fullName email')
      .populate('items.sweet', 'name category price')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Order.countDocuments(query);

    return sendApiResponse(res, 200, 'All orders retrieved successfully', {
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      totalOrders: total,
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return sendApiError(res, 500, 'Internal server error');
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new sendApiError(400, 'Invalid order ID');
    }

    const order = await Order.findById(orderId)
      .populate('user', 'fullName email')
      .populate('items.sweet', 'name category price');

    if (!order) {
      throw new sendApiError(404, 'Order not found');
    }

    if (userRole !== 'admin' && order.user._id.toString() !== userId.toString()) {
      throw new sendApiError(403, 'Access denied');
    }

    return sendApiResponse(res, 200, 'Order retrieved successfully', order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    if (error instanceof sendApiError) {
      return res.status(error.statusCode).json(error);
    }
    return sendApiError(res, 500, 'Internal server error');
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new sendApiError(400, 'Invalid order ID');
    }

    const order = await Order.findById(orderId);
    if (!order) throw new sendApiError(404, 'Order not found');

    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true })
      .populate('user', 'fullName email')
      .populate('items.sweet', 'name category price');

    return sendApiResponse(res, 200, 'Order status updated successfully', updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    if (error instanceof sendApiError) {
      return res.status(error.statusCode).json(error);
    }
    return sendApiError(res, 500, 'Internal server error');
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new sendApiError(400, 'Invalid order ID');
    }

    const order = await Order.findById(orderId);
    if (!order) throw new sendApiError(404, 'Order not found');

    if (order.user.toString() !== userId.toString()) {
      throw new sendApiError(403, 'Access denied');
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      throw new sendApiError(400, 'Order cannot be cancelled');
    }

    order.status = 'cancelled';
    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate('user', 'fullName email')
      .populate('items.sweet', 'name category price');

    return sendApiResponse(res, 200, 'Order cancelled successfully', updatedOrder);
  } catch (error) {
    console.error('Cancel order error:', error);
    if (error instanceof sendApiError) {
      return res.status(error.statusCode).json(error);
    }
    return sendApiError(res, 500, 'Internal server error');
  }
};
