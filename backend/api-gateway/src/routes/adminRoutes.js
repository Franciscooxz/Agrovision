const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  updateUserRole,
  updateUserPlan,
  deleteUser,
  getStats,
} = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/plan', updateUserPlan);
router.delete('/users/:id', deleteUser);
router.get('/stats', getStats);

module.exports = router;
