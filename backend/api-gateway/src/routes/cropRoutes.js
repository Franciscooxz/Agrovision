const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { checkCropLimit } = require('../middleware/planMiddleware');

const {
  createCrop,
  getCrops,
  getCropById,
  updateCrop,
  deleteCrop,
  getCropAnalysisHistory,
} = require('../controllers/cropController');

router.use(protect);

// FIX: Solo una definición del POST "/" con checkCropLimit
router.post('/', checkCropLimit, createCrop);
router.get('/', getCrops);
router.get('/:id/history', getCropAnalysisHistory);
router.get('/:id', getCropById);
router.put('/:id', updateCrop);
router.delete('/:id', deleteCrop);

module.exports = router;
