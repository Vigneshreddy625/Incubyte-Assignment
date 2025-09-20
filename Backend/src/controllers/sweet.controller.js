import { Sweet } from '../models/sweet.model.js';
import { sendApiError } from '../utils/ApiError.js';
import { sendApiResponse } from "../utils/ApiResponse.js"
import { validateObjectId } from '../utils/validation.js';

const createSweet = async (req, res) => {
  try {
    const sweet = new Sweet(req.body);
    const savedSweet = await sweet.save();
    return sendApiResponse(res, 201, 'Sweet created successfully', savedSweet);
  } catch (error) {
    if (error.code === 11000) {
      return sendApiError(res, 409, 'A sweet with this name already exists');
    }
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return sendApiError(res, 400, 'Validation failed', validationErrors);
    }
    console.error('Error creating sweet:', error);
    return sendApiError(res, 500, 'Internal server error');
  }
};

const getAllSweets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (page < 1 || limit < 1 || limit > 100) {
      return sendApiError(res, 400, 'Invalid pagination parameters. Page must be >= 1, limit must be 1-100');
    }

    const [sweets, totalCount] = await Promise.all([
      Sweet.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Sweet.countDocuments()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const paginationInfo = {
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };

    return sendApiResponse(res, 200, 'Sweets retrieved successfully', {
      sweets,
      pagination: paginationInfo
    });

  } catch (error) {
    console.error('Error fetching sweets:', error);
    return sendApiError(res, 500, 'Internal server error');
  }
};

const searchSweets = async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
    const query = {};

    if (name) query.name = { $regex: name.trim(), $options: 'i' };
    if (category) query.category = { $regex: category.trim(), $options: 'i' };

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      const min = parseFloat(minPrice);
      const max = parseFloat(maxPrice);

      if (minPrice !== undefined) {
        if (isNaN(min) || min < 0) return sendApiError(res, 400, 'minPrice must be a non-negative number');
        query.price.$gte = min;
      }

      if (maxPrice !== undefined) {
        if (isNaN(max) || max < 0) return sendApiError(res, 400, 'maxPrice must be a non-negative number');
        query.price.$lte = max;
      }

      if (minPrice !== undefined && maxPrice !== undefined && min > max) {
        return sendApiError(res, 400, 'minPrice cannot be greater than maxPrice');
      }
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return sendApiError(res, 400, 'Invalid pagination parameters');
    }
    const skip = (pageNum - 1) * limitNum;

    const [sweets, totalCount] = await Promise.all([
      Sweet.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Sweet.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    return sendApiResponse(res, 200, 'Search completed successfully', {
      sweets,
      searchCriteria: { name, category, minPrice, maxPrice },
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error searching sweets:', error);
    return sendApiError(res, 500, 'Internal server error');
  }
};

const updateSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedSweet = await Sweet.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!updatedSweet) {
      return sendApiError(res, 404, 'Sweet not found');
    }

    return sendApiResponse(res, 200, 'Sweet updated successfully', updatedSweet);
  } catch (error) {
    if (error.code === 11000) {
      return sendApiError(res, 409, 'A sweet with this name already exists');
    }
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return sendApiError(res, 400, 'Validation failed', validationErrors);
    }
    console.error('Error updating sweet:', error);
    return sendApiError(res, 500, 'Internal server error');
  }
};

const deleteSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSweet = await Sweet.findByIdAndDelete(id);

    if (!deletedSweet) {
      return sendApiError(res, 404, 'Sweet not found');
    }

    return sendApiResponse(res, 200, 'Sweet deleted successfully', {
      deletedSweet: {
        id: deletedSweet._id,
        name: deletedSweet.name
      }
    });
  } catch (error) {
    console.error('Error deleting sweet:', error);
    return sendApiError(res, 500, 'Internal server error');
  }
};

const purchaseSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return sendApiError(res, 400, 'Purchase quantity must be a positive integer');
    }

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      return sendApiError(res, 404, 'Sweet not found');
    }
    if (sweet.quantity < quantity) {
      return sendApiError(res, 400, `Insufficient stock. Only ${sweet.quantity} units available`);
    }

    const updatedSweet = await Sweet.findByIdAndUpdate(id, { $inc: { quantity: -quantity } }, { new: true });
    return sendApiResponse(res, 200, 'Purchase completed successfully', {
      sweet: updatedSweet,
      purchasedQuantity: quantity,
      totalCost: (sweet.price * quantity).toFixed(2)
    });
  } catch (error) {
    console.error('Error processing purchase:', error);
    return sendApiError(res, 500, 'Internal server error');
  }
};

const restockSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return sendApiError(res, 400, 'Restock quantity must be a positive integer');
    }

    const sweet = await Sweet.findById(id);
    if (!sweet) {
      return sendApiError(res, 404, 'Sweet not found');
    }

    const updatedSweet = await Sweet.findByIdAndUpdate(id, { $inc: { quantity: quantity } }, { new: true });
    return sendApiResponse(res, 200, 'Sweet restocked successfully', {
      sweet: updatedSweet,
      restockedQuantity: quantity,
      previousQuantity: sweet.quantity
    });
  } catch (error) {
    console.error('Error restocking sweet:', error);
    return sendApiError(res, 500, 'Internal server error');
  }
};

export {
  createSweet,
  getAllSweets,
  searchSweets,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet,
};