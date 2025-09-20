import mongoose from 'mongoose';
import { sendApiError } from './ApiError.js';

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return sendApiError(res, 400, 'Invalid sweet ID format');
  }
  next();
};

export { validateObjectId };