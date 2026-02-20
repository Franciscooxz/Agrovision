const Parcel = require('../models/Parcel');
const sendResponse = require("../utils/sendResponse");

exports.createParcel = async (req, res, next) => {
  try {
    const parcel = await Parcel.create({
      ...req.body,
      owner: req.user.id
    });

    return sendResponse(res, 201, true, "Parcel created successfully", parcel);
  } catch (error) {
    next(error);
  }
};

exports.getParcels = async (req, res, next) => {
  try {
    const parcels = await Parcel.find({ owner: req.user.id });
    return sendResponse(res, 200, true, "Parcels fetched successfully", parcels);
  } catch (error) {
    next(error);
  }
};
