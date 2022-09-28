const User = require('../../../models/users');
const HttpError = require('../../../models/http-error');
const jwt = require('jsonwebtoken');

const {
  UNAUTHENTICATED_ERROR,
  AUTHENTICATION_FAILED_ERROR,
  USER_NOT_FOUND_ERROR,
} = require('../../../util/string-literals');

async function getUser(authHeader) {
  try {
    const token = authHeader.split(' ')[1];

    if (!token) throw new HttpError(UNAUTHENTICATED_ERROR, 403);

    const decodedToken = jwt.verify(token, process.env.JWT_KEY);

    const user = await User.findOne({ where: { userId: decodedToken.userId } });

    if (user) {
      return user;
    }

    throw new HttpError(USER_NOT_FOUND_ERROR, 404);
  } catch (err) {
    throw new HttpError(AUTHENTICATION_FAILED_ERROR, 500);
  }
}

module.exports = {
  getUser,
};
