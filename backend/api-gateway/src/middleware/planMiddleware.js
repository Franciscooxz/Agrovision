const Crop = require("../models/Crop");
const User = require("../models/User");
const sendResponse = require("../utils/sendResponse");

exports.checkCropLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.plan === "PRO") {
      return next(); // sin límite
    }

    const cropCount = await Crop.countDocuments({
      createdBy: req.user.id,
    });

    if (cropCount >= 3) {
      return sendResponse(res, 403, false, "Free plan limit reached. Upgrade to PRO.");
    }

    next();

  } catch (error) {
    return sendResponse(res, 500, false, "Plan validation error");
  }
};
