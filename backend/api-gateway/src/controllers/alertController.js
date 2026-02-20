const Alert = require("../models/Alert");
const sendResponse = require("../utils/sendResponse");

exports.getUserAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({
      user: req.user.id,
    })
      .populate("crop", "name")
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, true, "Alerts fetched successfully", alerts);
  } catch (error) {
    return sendResponse(res, 500, false, "Error fetching alerts");
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
      return sendResponse(res, 404, false, "Alert not found");
    }

    return sendResponse(res, 200, true, "Alert resolved successfully", alert);
  } catch (error) {
    return sendResponse(res, 500, false, "Error resolving alert");
  }
};
