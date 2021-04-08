const fs = require('fs');
const uuid = require('uuid').v4;
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const HttpError = require('../models/http-error');

const Place = require('../models/place-model');
const User = require('../models/user-model');

let DUMMY_PLACES = [
  {
    id: 'p1',
    titile: 'Empire State Building',
    description: 'One of the most famous sky scrapers in the world',
    address: '20 W 34th St,New York, NY 10001',
    creator: 'u1',
  },
];
exports.getPlaces = async (req, res, next) => {
  try {
    const places = await Place.find({});
    res.status(200).json({ places });
  } catch (error) {
    const errros = new HttpError('Something wrong please try later', 500);
  }
};

exports.getPlaceById = async (req, res, next) => {
  const place_id = req.params.place_id;
  // console.log(place_id);
  let place;
  try {
    place = await Place.findById(place_id);
  } catch (error) {
    // console.log(error.reason);
    const errors = new HttpError('Something wrong please try later', 500);
    // res.status(500).json({ message: err });
    return next(errors);
  }
  if (!place) {
    res.status(400).json({ errors: 'Place not found' });
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};
exports.getPlaceByUserId = async (req, res, next) => {
  const user_id = req.params.user_id;
  // console.log(user_id);
  try {
    const places = await Place.find({ creator: user_id });
    if (!places) {
      res.status(404).json({ errors: 'User places not found' });
    }
    res.status(200).json({
      places: places.map((place) => place.toObject({ getters: true })),
    });
  } catch (error) {
    const errors = new HttpError('Something wrong please try later', 500);
    return next(errors);
  }
};
exports.createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
  }
  // console.log(req.body);
  const { title, description, address, creator } = req.body;
  const createdPlace = new Place({
    title,
    description,
    address,
    image: req.file.path,
    creator,
  });
  // console.log(createdPlace);
  let user;
  try {
    user = await User.findById(creator);
  } catch (error) {
    const err = new HttpError('Creating place failed', 500);
    return next(err);
  }
  // console.log(user);
  if (!user) {
    const error = new HttpError('User not found', 404);
    return next(error);
  }
  try {
    // console.log(createdPlace);
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({ session });
    user.places.push(createdPlace);
    // console.log(user);
    await user.save({ session });
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    console.log(error);
    const err = new HttpError('Something wrong', 500);
    return next(err);
  }
  res
    .status(201)
    .json({ place: createdPlace, message: 'Place created Successfully.' });
};
exports.updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
  }
  const place_id = req.params.place_id;
  const { title, description, address, creator } = req.body;

  let place;
  try {
    place = await Place.findById(place_id);
  } catch (error) {
    res.status(500).json({ message: error });
  }
  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError('Unauthorized', 401);
    return next(error);
  }

  place.title = title;
  place.description = description;
  try {
    await place.save();
  } catch (error) {
    res.status(500).json({ message: error });
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};
exports.deletePlace = async (req, res, next) => {
  const place_id = req.params.place_id;
  // console.log(place_id);
  let place;
  try {
    place = await Place.findById(place_id).populate('creator');
  } catch (error) {
    res.status(500).json({ message: error });
  }
  // console.log(place);
  if (!place) {
    const err = new HttpError('Place not found', 404);
    return next(err);
  }
  if (place.creator.id !== req.userData.userId) {
    const err = new HttpError('Unauthorized', 401);
    return next(err);
  }
  const imagePath = place.image;
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.remove({ session });
    place.creator.places.pull(place);
    await place.creator.save({ session });
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    const err = new HttpError('Something error', 500);
    return next(err);
  }
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });
  res.status(200).json({ message: 'Place deleted' });
};
