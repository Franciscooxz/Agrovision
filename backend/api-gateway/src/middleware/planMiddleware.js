const Crop = require("../models/Crop");
const User = require("../models/User");

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
      return res.status(403).json({
        message: "Free plan limit reached. Upgrade to PRO.",
      });
    }

    next();

  } catch (error) {
    res.status(500).json({ message: "Plan validation error" });
  }
};
