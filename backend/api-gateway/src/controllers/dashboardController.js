const Crop = require("../models/Crop");
const Analysis = require("../models/Analysis");

exports.getMetrics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total cultivos del usuario
    const totalCrops = await Crop.countDocuments({ createdBy: userId });

    // Obtener cultivos del usuario
    const userCrops = await Crop.find({ createdBy: userId }).select("_id");

    const cropIds = userCrops.map(crop => crop._id);

    // Total análisis relacionados a esos cultivos
    const totalAnalyses = await Analysis.countDocuments({
      crop: { $in: cropIds }
    });

    // Contar por estado
    const healthyCrops = await Crop.countDocuments({
      createdBy: userId,
      healthStatus: "Saludable"
    });

    const atRiskCrops = await Crop.countDocuments({
      createdBy: userId,
      healthStatus: "En riesgo"
    });

    const criticalCrops = await Crop.countDocuments({
      createdBy: userId,
      healthStatus: "Posible plaga"
    });

    // Promedio de confianza
    const analyses = await Analysis.find({
      crop: { $in: cropIds }
    }).select("confidence");

    const averageConfidence =
      analyses.length > 0
        ? analyses.reduce((acc, curr) => acc + curr.confidence, 0) / analyses.length
        : 0;

    res.json({
      totalCrops,
      totalAnalyses,
      healthyCrops,
      atRiskCrops,
      criticalCrops,
      averageConfidence: Number(averageConfidence.toFixed(2)),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching dashboard metrics" });
  }
};
