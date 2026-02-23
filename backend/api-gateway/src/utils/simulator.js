const Sensor = require('../models/Sensor');
const Alert = require('../models/Alert');
const User = require('../models/User');
const Crop = require('../models/Crop');

const startSimulation = (app) => {
  // Intervalo de 30 segundos para no saturar la DB
  setInterval(async () => {
    try {
      const io = app.get('io');
      if (!io) return;

      // Valores realistas con variación
      const randomHumidity = Math.round(40 + Math.random() * 55); // 40-95%
      const randomTemp = Math.round(15 + Math.random() * 25);     // 15-40°C

      const humidity = await Sensor.create({
        name: 'Humedad Suelo',
        type: 'humidity',
        value: randomHumidity,
        unit: '%',
      });

      const temperature = await Sensor.create({
        name: 'Temperatura Ambiente',
        type: 'temperature',
        value: randomTemp,
        unit: '°C',
      });

      io.emit('newSensorData', humidity);
      io.emit('newSensorData', temperature);

      // Solo crear alertas cuando haya usuarios y cultivos registrados
      const user = await User.findOne();
      const crop = await Crop.findOne({ createdBy: user?._id });

      if (!user || !crop) return;

      // HUMEDAD CRÍTICA (< 45%)
      if (randomHumidity < 45) {
        const alert = await Alert.create({
          user: user._id,
          crop: crop._id,
          message: `Humedad crítica detectada: ${randomHumidity}%`,
          severity: randomHumidity < 35 ? 'high' : 'medium',
        });
        io.emit('newAlert', alert);
        io.to(user._id.toString()).emit('newAlert', alert);
      }

      // TEMPERATURA ALTA (> 35°C)
      if (randomTemp > 35) {
        const alert = await Alert.create({
          user: user._id,
          crop: crop._id,
          message: `Temperatura alta detectada: ${randomTemp}°C`,
          severity: randomTemp > 38 ? 'high' : 'medium',
        });
        io.emit('newAlert', alert);
        io.to(user._id.toString()).emit('newAlert', alert);
      }

    } catch (error) {
      console.error('Error en simulador:', error.message);
    }
  }, 30000);
};

module.exports = startSimulation;
