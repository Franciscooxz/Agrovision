const axios = require("axios");

exports.analyzeCrop = async (cropData) => {
  try {
    const response = await axios.post(
      "http://localhost:8000/analyze",
      {
        name: cropData.name,
        type: cropData.type,
        location: cropData.location,
        healthStatus: cropData.healthStatus
      }
    );

    return response.data;
  } catch (error) {
    console.error("AI Service Error:", error.message);
    throw new Error("AI Service unavailable");
  }
};
