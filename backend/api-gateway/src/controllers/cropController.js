const Crop = require("../models/Crop");
const Analysis = require("../models/Analysis");
const Alert = require("../models/Alert");
const { analyzeCrop } = require("../services/aiService");
const User = require("../models/User");
const { sendAlertEmail } = require("../services/emailService");
const sendResponse = require("../utils/sendResponse");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

// Crear cultivo + análisis + alerta automática
exports.createCrop = asyncHandler(async (req, res) => {
  const crop = await Crop.create({
    ...req.body,
    createdBy: req.user.id,
  });

  const aiResult = await analyzeCrop(crop);

  const analysisRecord = await Analysis.create({
    crop: crop._id,
    prediction: aiResult.prediction,
    confidence: aiResult.confidence,
    recommendation: aiResult.recommendation,
  });

  crop.healthStatus = aiResult.prediction;
  crop.lastAnalysis = new Date();
  await crop.save();

  if (aiResult.prediction === "Posible plaga" || aiResult.prediction === "Crítico") {
    const newAlert = await Alert.create({
      user: req.user.id,
      crop: crop._id,
      message: `Alerta crítica detectada en ${crop.name}`,
      severity: "high",
    });

    const io = req.app.get("io");
    io.to(req.user.id).emit("newAlert", newAlert);

    const user = await User.findById(req.user.id);
    await sendAlertEmail(user.email, crop.name);
  }

  return sendResponse(res, 201, true, "Crop created successfully", {
    crop,
    analysis: analysisRecord,
  });
});

// Obtener todos los cultivos del usuario
exports.getCrops = asyncHandler(async (req, res) => {
  const crops = await Crop.find({ createdBy: req.user.id });
  return sendResponse(res, 200, true, "Crops fetched successfully", crops);
});

// Obtener cultivo por ID
exports.getCropById = asyncHandler(async (req, res, next) => {
  const crop = await Crop.findOne({
    _id: req.params.id,
    createdBy: req.user.id,
  });

  if (!crop) {
    return next(new AppError("Crop not found", 404));
  }

  return sendResponse(res, 200, true, "Crop fetched successfully", crop);
});

// Obtener historial de análisis
exports.getCropAnalysisHistory = asyncHandler(async (req, res, next) => {
  const crop = await Crop.findOne({
    _id: req.params.id,
    createdBy: req.user.id,
  });

  if (!crop) {
    return next(new AppError("Crop not found", 404));
  }

  const analyses = await Analysis.find({
    crop: req.params.id,
  }).sort({ createdAt: -1 });

  return sendResponse(res, 200, true, "Analysis history fetched successfully", analyses);
});

// Actualizar cultivo
exports.updateCrop = asyncHandler(async (req, res, next) => {
  const crop = await Crop.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user.id },
    req.body,
    { new: true }
  );

  if (!crop) {
    return next(new AppError("Crop not found", 404));
  }

  return sendResponse(res, 200, true, "Crop updated successfully", crop);
});

// Eliminar cultivo + historial + alertas
exports.deleteCrop = asyncHandler(async (req, res, next) => {
  const crop = await Crop.findOneAndDelete({
    _id: req.params.id,
    createdBy: req.user.id,
  });

  if (!crop) {
    return next(new AppError("Crop not found", 404));
  }

  await Analysis.deleteMany({ crop: req.params.id });
  await Alert.deleteMany({ crop: req.params.id });

  return sendResponse(
    res,
    200,
    true,
    "Crop, analyses and alerts deleted successfully"
  );
});
