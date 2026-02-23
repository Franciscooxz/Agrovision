const User = require('../models/User');
const Crop = require('../models/Crop');
const Alert = require('../models/Alert');
const Sensor = require('../models/Sensor');

// GET all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -refreshToken').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// PUT update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'farmer', 'technician'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({ message: 'No puedes cambiar tu propio rol' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password -refreshToken');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating role' });
  }
};

// PUT update user plan
exports.updateUserPlan = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['FREE', 'PRO'].includes(plan)) {
      return res.status(400).json({ message: 'Plan inválido' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { plan },
      { new: true }
    ).select('-password -refreshToken');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating plan' });
  }
};

// DELETE user
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// GET global stats
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalCrops, totalAlerts, totalSensors, activeAlerts, proUsers] =
      await Promise.all([
        User.countDocuments(),
        Crop.countDocuments(),
        Alert.countDocuments(),
        Sensor.countDocuments(),
        Alert.countDocuments({ resolved: false }),
        User.countDocuments({ plan: 'PRO' }),
      ]);

    res.json({ totalUsers, totalCrops, totalAlerts, totalSensors, activeAlerts, proUsers });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
};
