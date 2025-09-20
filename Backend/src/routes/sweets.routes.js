import { Router } from 'express';
import {
  createSweet,
  getAllSweets,
  searchSweets,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet,
} from '../controllers/sweet.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { validateObjectId } from '../utils/validation.js';

const router = Router();

router.get('/', getAllSweets);
router.get('/search', searchSweets);
router.post('/', protect, admin, createSweet);
router.patch('/:id', protect, admin, validateObjectId, updateSweet);
router.delete('/:id', protect, admin, validateObjectId, deleteSweet);
router.post('/:id/restock', protect, admin, validateObjectId, restockSweet);
router.post('/:id/purchase', protect, validateObjectId, purchaseSweet);

export default router;