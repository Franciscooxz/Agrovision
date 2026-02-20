const Parcel = require('../models/Parcel');

exports.createParcel = async (req, res, next) => {
  try {
    const parcel = await Parcel.create({
      ...req.body,
      owner: req.user.id
    });

    res.status(201).json(parcel);
  } catch (error) {
    next(error);
  }
};

exports.getParcels = async (req, res, next) => {
  try {
    const parcels = await Parcel.find({ owner: req.user.id });
    res.json(parcels);
  } catch (error) {
    next(error);
  }
};
