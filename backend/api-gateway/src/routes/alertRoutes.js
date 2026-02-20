const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  getUserAlerts,
  resolveAlert,
} = require("../controllers/alertController");

router.use(protect);

router.get("/", getUserAlerts);

router.put("/:id/resolve", protect, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: "Alerta no encontrada" });
    }

    alert.resolved = true;
    await alert.save();

    res.json({ message: "Alerta resuelta" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
