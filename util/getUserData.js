const User = require('../models/users');
const HttpError = require('../models/http-error');
const jwt = require('jsonwebtoken');

const AUTHENTICATION_FAILED_ERROR = 'Hitelesítés sikertelen.';
const USER_NOT_FOUND_ERROR = 'A felhasználó nem található.';

const getUserData = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) return next(new HttpError(AUTHENTICATION_FAILED_ERROR, 403));

    const decodedToken = jwt.verify(token, process.env.JWT_KEY);

    const user = await User.findOne({ where: { userId: decodedToken.userId } });

    return user || next(new HttpError(USER_NOT_FOUND_ERROR, 404));
  } catch (err) {
    return next(new HttpError(err, 500));
  }
};

module.exports = getUserData;
