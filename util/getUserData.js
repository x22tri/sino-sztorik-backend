const User = require('../models/users');
const HttpError = require('../models/http-error');
const jwt = require('jsonwebtoken');

const {
  UNAUTHENTICATED_ERROR,
  AUTHENTICATION_FAILED_ERROR,
  USER_NOT_FOUND_ERROR,
} = require('./string-literals');

const getUserData = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) return next(new HttpError(UNAUTHENTICATED_ERROR, 403));

    const decodedToken = jwt.verify(token, process.env.JWT_KEY);

    const user = await User.findOne({ where: { userId: decodedToken.userId } });

    return user || next(new HttpError(USER_NOT_FOUND_ERROR, 404));
  } catch (err) {
    return next(new HttpError(AUTHENTICATION_FAILED_ERROR, 500));
  }
};

module.exports = getUserData;
