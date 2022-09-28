const User = require('../../models/users');
const HttpError = require('../../models/http-error');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  WRONG_CREDENTIALS_ERROR,
  LOGIN_FAILED_ERROR,
} = require('../../util/string-literals');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const identifiedUser = await User.findOne({ where: { email: email } });

    if (!identifiedUser) {
      throw new HttpError(WRONG_CREDENTIALS_ERROR, 401);
    }

    const isValidPassword = await bcrypt.compare(
      password,
      identifiedUser.password
    );

    if (isValidPassword === false) {
      throw new HttpError(WRONG_CREDENTIALS_ERROR, 401);
    }

    const token = jwt.sign(
      { userId: identifiedUser.userId },
      process.env.JWT_KEY
    );

    res.status(200).json({ userId: identifiedUser.userId, token: token });
  } catch (err) {
    next(err || new HttpError(LOGIN_FAILED_ERROR, 500));
  }
};

module.exports = {
  login,
};
