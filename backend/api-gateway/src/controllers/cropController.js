const Crop = require("../models/Crop");
const Analysis = require("../models/Analysis");
const Alert = require("../models/Alert");
const { analyzeCrop } = require("../services/aiService");
const User = require("../models/User");
const { sendAlertEmail } = require("../services/emailService");
const sendResponse = require("../utils/sendResponse");


// Crear cultivo + análisis + alerta automática
exports.createCrop = async (req, res) => {
  try {
    let crop = await Crop.create({
      ...req.body,
      createdBy: req.user.id,
    });

    // Llamar microservicio IA
    const aiResult = await analyzeCrop(crop);

    // Guardar análisis en colección Analysis
    const analysisRecord = await Analysis.create({
      crop: crop._id,
      prediction: aiResult.prediction,
      confidence: aiResult.confidence,
      recommendation: aiResult.recommendation,
    });

    // Actualizar estado del cultivo
    crop.healthStatus = aiResult.prediction;
    crop.lastAnalysis = new Date();
    await crop.save();

    // Crear alerta automática si es estado crítico
    if (
    aiResult.prediction === "Posible plaga" ||
    aiResult.prediction === "Crítico"
    ) {
    const newAlert = await Alert.create({
        user: req.user.id,
        crop: crop._id,
        message: `Alerta crítica detectada en ${crop.name}`,
        severity: "high",
    });

    // WebSocket
    const io = req.app.get("io");
    io.to(req.user.id).emit("newAlert", newAlert);

    // Email automático
    const user = await User.findById(req.user.id);
    await sendAlertEmail(user.email, crop.name);
    }

    return sendResponse(res, 201, true, "Crop created successfully", {
      crop,
      analysis: analysisRecord,
    });

  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Error creating crop");
  }
};


// Obtener todos los cultivos del usuario
exports.getCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ createdBy: req.user.id });
    return sendResponse(res, 200, true, "Crops fetched successfully", crops);
  } catch (error) {
    return sendResponse(res, 500, false, "Error fetching crops");
  }
};


// Obtener cultivo por ID
exports.getCropById = async (req, res) => {
  try {
    const crop = await Crop.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!crop) {
      return sendResponse(res, 404, false, "Crop not found");
    }

    return sendResponse(res, 200, true, "Crop fetched successfully", crop);
  } catch (error) {
    return sendResponse(res, 500, false, "Error fetching crop");
  }
};


// Obtener historial de análisis
exports.getCropAnalysisHistory = async (req, res) => {
  try {
    const crop = await Crop.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!crop) {
      return sendResponse(res, 404, false, "Crop not found");
    }

    const analyses = await Analysis.find({
      crop: req.params.id,
    }).sort({ createdAt: -1 });

    return sendResponse(res, 200, true, "Analysis history fetched successfully", analyses);

  } catch (error) {
    return sendResponse(res, 500, false, "Error fetching analysis history");
  }
};


// Actualizar cultivo
exports.updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true }
    );

    if (!crop) {
      return sendResponse(res, 404, false, "Crop not found");
    }

    return sendResponse(res, 200, true, "Crop updated successfully", crop);

  } catch (error) {
    return sendResponse(res, 500, false, "Error updating crop");
  }
};


// Eliminar cultivo + historial + alertas
exports.deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!crop) {
      return sendResponse(res, 404, false, "Crop not found");
    }

    // Eliminar análisis asociados
    await Analysis.deleteMany({ crop: req.params.id });

    // Eliminar alertas asociadas
    await Alert.deleteMany({ crop: req.params.id });

    return sendResponse(
      res,
      200,
      true,
      "Crop, analyses and alerts deleted successfully"
    );

  } catch (error) {
    return sendResponse(res, 500, false, "Error deleting crop");
  }
};
