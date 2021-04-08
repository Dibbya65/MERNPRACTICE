const HttpError = require('../models/http-error');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; //Authorization: 'Bearer TOKEN'
    if (!token) {
      const error = new HttpError('Authentication Failed!', 401);
      return next(error);
    }
    const decodedToken = jwt.verify(token, 'supersecret_dont_share');
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    const err = new HttpError('Authentication Failed!', 401);
    return next(err);
  }
};
