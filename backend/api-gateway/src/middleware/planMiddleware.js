const Crop = require("../models/Crop");
const User = require("../models/User");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

exports.checkCropLimit = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.plan === "PRO") {
    return next();
  }

  const cropCount = await Crop.countDocuments({
    createdBy: req.user.id,
  });

  if (cropCount >= 3) {
    return next(new AppError("Free plan limit reached. Upgrade to PRO.", 403));
  }

  return next();
});
