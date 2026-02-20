const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true }, // humidity, temperature
    value: { type: Number, required: true },
    unit: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sensor", sensorSchema);
