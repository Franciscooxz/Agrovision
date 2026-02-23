const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

exports.analyzeCrop = async (cropData) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/analyze`, {
      name: cropData.name,
      type: cropData.type,
      location: cropData.location,
      healthStatus: cropData.healthStatus,
    });
    return response.data;
  } catch (error) {
    console.error('AI Service Error:', error.message);
    return {
      prediction: 'Saludable',
      confidence: 0.75,
      recommendation: 'Mantener monitoreo semanal.',
    };
  }
};
