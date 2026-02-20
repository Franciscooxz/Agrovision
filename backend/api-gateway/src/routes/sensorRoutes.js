const express = require("express");
const router = express.Router();
const Sensor = require("../models/Sensor");
const { protect, authorize } = require("../middleware/authMiddleware");
const sendResponse = require("../utils/sendResponse");

// SOLO USUARIOS AUTENTICADOS PUEDEN VER
router.get("/", protect, async (req, res) => {
  const sensors = await Sensor.find().sort({ createdAt: -1 });
  return sendResponse(res, 200, true, "Sensors fetched successfully", sensors);
});

// SOLO ADMIN PUEDE CREAR DATOS
router.post("/", protect, authorize("admin"), async (req, res) => {
  const sensor = await Sensor.create(req.body);

  const io = req.app.get("io");
  io.emit("newSensorData", sensor);

  return sendResponse(res, 201, true, "Sensor created successfully", sensor);
});

module.exports = router;
