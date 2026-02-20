const express = require('express');
const { createParcel, getParcels } = require('../controllers/parcelController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createParcel);
router.get('/', getParcels);

module.exports = router;
