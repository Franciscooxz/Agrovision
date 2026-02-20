const Parcel = require("../models/Parcel");
const sendResponse = require("../utils/sendResponse");
const asyncHandler = require("../utils/asyncHandler");

exports.createParcel = asyncHandler(async (req, res) => {
  const parcel = await Parcel.create({
    ...req.body,
    owner: req.user.id,
  });

  return sendResponse(res, 201, true, "Parcel created successfully", parcel);
});

exports.getParcels = asyncHandler(async (req, res) => {
  const parcels = await Parcel.find({ owner: req.user.id });
  return sendResponse(res, 200, true, "Parcels fetched successfully", parcels);
});
