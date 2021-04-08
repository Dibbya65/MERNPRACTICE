const uuid = require('uuid').v4;
const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user-model');

exports.getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (error) {
    res.status(500).json({ message: error });
  }
  res
    .status(200)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};
exports.singup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
  }
  const { name, email, password } = req.body;
  let user_exist;
  try {
    user_exist = await User.findOne({ email: email });
  } catch (error) {
    res.status(500).json({ message: error });
  }

  if (user_exist) {
    res.status(422).json({ message: 'Email already taken' });
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError('Could no create user, please try later');
    return next(error);
  }
  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });
  try {
    await createdUser.save();
  } catch (error) {
    res.status(500).json({ message: error });
  }
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      'supersecret_dont_share',
      { expiresIn: '1h' }
    );
  } catch (error) {
    const err = new HttpError('Could no create user, please try later');
    return next(err);
  }
  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    token: token,
  });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user_exist = await User.findOne({ email: email });
    if (!user_exist) {
      const error = new HttpError('User not found', 401);
      return next(error);
    }
    const isValidPassword = await bcrypt.compare(password, user_exist.password);
    if (!isValidPassword) {
      const err = new HttpError('Invalid password', 403);
      return next(err);
    }
    let token;
    try {
      token = jwt.sign(
        { userId: user_exist.id, email: user_exist.email },
        'supersecret_dont_share',
        { expiresIn: '1h' }
      );
    } catch (error) {
      const err = new HttpError('Invalid credentials');
      return next(err);
    }
    console.log(user_exist);
    res.status(200).json({
      userId: user_exist.id,
      email: user_exist.email,
      token: token,
    });
  } catch (err) {
    return next(err);
  }
};
