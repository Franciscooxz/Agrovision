const Alert = require("../models/Alert");
const sendResponse = require("../utils/sendResponse");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

exports.getUserAlerts = asyncHandler(async (req, res) => {
  const alerts = await Alert.find({
    user: req.user.id,
  })
    .populate("crop", "name")
    .sort({ createdAt: -1 });

  return sendResponse(res, 200, true, "Alerts fetched successfully", alerts);
});

exports.resolveAlert = asyncHandler(async (req, res, next) => {
  const alert = await Alert.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { resolved: true },
    { new: true }
  );

  if (!alert) {
    return next(new AppError("Alert not found", 404));
  }

  return sendResponse(res, 200, true, "Alert resolved successfully", alert);
});
