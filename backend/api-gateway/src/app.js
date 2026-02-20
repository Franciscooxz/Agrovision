const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const parcelRoutes = require('./routes/parcelRoutes');

const cropRoutes = require("./routes/cropRoutes");

const dashboardRoutes = require("./routes/dashboardRoutes");

const alertRoutes = require("./routes/alertRoutes");

const sensorRoutes = require("./routes/sensorRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/parcels', parcelRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/sensors", sensorRoutes);

app.use(errorHandler);

module.exports = app;
