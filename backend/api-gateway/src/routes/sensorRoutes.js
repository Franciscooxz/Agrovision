const express = require("express");
const router = express.Router();
const Sensor = require("../models/Sensor");
const { protect, authorize } = require("../middleware/authMiddleware");

// SOLO USUARIOS AUTENTICADOS PUEDEN VER
router.get("/", protect, async (req, res) => {
  const sensors = await Sensor.find().sort({ createdAt: -1 });
  res.json(sensors);
});

// SOLO ADMIN PUEDE CREAR DATOS
router.post("/", protect, authorize("admin"), async (req, res) => {
  const sensor = await Sensor.create(req.body);

  const io = req.app.get("io");
  io.emit("newSensorData", sensor);

  res.status(201).json(sensor);
});

module.exports = router;
