const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { getMetrics } = require("../controllers/dashboardController");

router.use(protect);

router.get("/metrics", getMetrics);

module.exports = router;
