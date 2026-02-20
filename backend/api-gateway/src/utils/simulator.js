const Sensor = require("../models/Sensor");
const Alert = require("../models/Alert");
const User = require("../models/User");
const Crop = require("../models/Crop");

const startSimulation = (app) => {
  setInterval(async () => {
    try {
      const randomHumidity = Math.floor(Math.random() * 30) + 50;
      const randomTemp = Math.floor(Math.random() * 15) + 20;

      const humidity = await Sensor.create({
        name: "Humedad Suelo",
        type: "humidity",
        value: randomHumidity,
        unit: "%",
      });

      const temperature = await Sensor.create({
        name: "Temperatura Ambiente",
        type: "temperature",
        value: randomTemp,
        unit: "°C",
      });

      const io = app.get("io");

      io.emit("newSensorData", humidity);
      io.emit("newSensorData", temperature);

      // Buscar usuario y cultivo existentes
      const user = await User.findOne();
      const crop = await Crop.findOne();

      if (!user || !crop) return;

      // HUMEDAD BAJA
      if (randomHumidity < 65) {
        const alert = await Alert.create({
          user: user._id,
          crop: crop._id,
          message: `Humedad baja detectada (${randomHumidity}%)`,
          severity: "medium",
        });

        io.emit("newAlert", alert);
      }

      // TEMPERATURA ALTA
      if (randomTemp > 30) {
        const alert = await Alert.create({
          user: user._id,
          crop: crop._id,
          message: `Temperatura alta detectada (${randomTemp}°C)`,
          severity: "high",
        });

        io.emit("newAlert", alert);
      }

    } catch (error) {
      console.error("Error en simulador:", error.message);
    }
  }, 5000);
};

module.exports = startSimulation;