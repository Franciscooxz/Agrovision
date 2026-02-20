const Crop = require("../models/Crop");
const Analysis = require("../models/Analysis");
const sendResponse = require("../utils/sendResponse");
const asyncHandler = require("../utils/asyncHandler");

exports.getMetrics = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const totalCrops = await Crop.countDocuments({ createdBy: userId });
  const userCrops = await Crop.find({ createdBy: userId }).select("_id");
  const cropIds = userCrops.map((crop) => crop._id);

  const totalAnalyses = await Analysis.countDocuments({
    crop: { $in: cropIds },
  });

  const healthyCrops = await Crop.countDocuments({
    createdBy: userId,
    healthStatus: "Saludable",
  });

  const atRiskCrops = await Crop.countDocuments({
    createdBy: userId,
    healthStatus: "En riesgo",
  });

  const criticalCrops = await Crop.countDocuments({
    createdBy: userId,
    healthStatus: "Posible plaga",
  });

  const analyses = await Analysis.find({
    crop: { $in: cropIds },
  }).select("confidence");

  const averageConfidence = analyses.length > 0
    ? analyses.reduce((acc, curr) => acc + curr.confidence, 0) / analyses.length
    : 0;

  return sendResponse(res, 200, true, "Dashboard metrics fetched successfully", {
    totalCrops,
    totalAnalyses,
    healthyCrops,
    atRiskCrops,
    criticalCrops,
    averageConfidence: Number(averageConfidence.toFixed(2)),
  });
});
