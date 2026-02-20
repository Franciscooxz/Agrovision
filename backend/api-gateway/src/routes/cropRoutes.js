const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { checkCropLimit } = require("../middleware/planMiddleware");

const {
  createCrop,
  getCrops,
  getCropById,
  updateCrop,
  deleteCrop,
  getCropAnalysisHistory,
} = require("../controllers/cropController");

router.use(protect);

router.post("/", createCrop);
router.get("/", getCrops);
router.get("/:id", getCropById);
router.put("/:id", updateCrop);
router.delete("/:id", deleteCrop);
router.post("/", checkCropLimit, createCrop);

router.get("/:id/history", getCropAnalysisHistory);

module.exports = router;
