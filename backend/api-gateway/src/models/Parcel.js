const mongoose = require('mongoose');

const parcelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cropType: String,
  areaHectares: Number,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  }
}, { timestamps: true });

parcelSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Parcel', parcelSchema);
