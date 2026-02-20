const Alert = require("../models/Alert");

exports.getUserAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({
      user: req.user.id,
    })
      .populate("crop", "name")
      .sort({ createdAt: -1 });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching alerts" });
  }
};

exports.resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { resolved: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: "Error resolving alert" });
  }
};
