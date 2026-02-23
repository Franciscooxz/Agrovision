const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { getUserAlerts, resolveAlert } = require('../controllers/alertController');

router.use(protect);

router.get('/', getUserAlerts);
router.put('/:id/resolve', resolveAlert);

module.exports = router;
