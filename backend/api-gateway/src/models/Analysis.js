const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Crop",
      required: true,
    },
    prediction: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
    },
    recommendation: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Analysis", analysisSchema);
