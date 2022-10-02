const User = require('../../models/users');
const HttpError = require('../../models/http-error');

const { getUser } = require('./utils/getUser');
const { updateUserInDatabase } = require('./utils/updateUserInDatabase');
const { findNextLesson } = require('./utils/findNextLesson');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { validationResult } = require('express-validator');
const { PW_SALT_ROUNDS } = require('../../util/config');

const {
  VALIDATION_FAILED_ERROR,
  EMAIL_TAKEN_ERROR,
  SIGNUP_FAILED_ERROR,
  WRONG_CREDENTIALS_ERROR,
  LOGIN_FAILED_ERROR,
} = require('../../util/string-literals');

async function signup(req, res, next) {
  try {
    if (!validationResult(req).isEmpty()) {
      throw new HttpError(VALIDATION_FAILED_ERROR, 422);
    }

    const { displayName, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email: email } });

    if (existingUser) {
      throw new HttpError(EMAIL_TAKEN_ERROR, 422);
    }

    const hashedPassword = await bcrypt.hash(password, PW_SALT_ROUNDS);

    const createdUser = await User.create({
      //userId is autoIncrementing, created automatically by Sequelize
      displayName,
      email,
      password: hashedPassword,
      currentTier: 1,
      currentLesson: 1,
    });

    const token = jwt.sign({ userId: createdUser.userId }, process.env.JWT_KEY);

    res.status(201).json({ userId: createdUser.userId, token: token });
  } catch (err) {
    next(err || new HttpError(SIGNUP_FAILED_ERROR, 500));
  }
}

async function login(req, res, next) {
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
}

async function advanceUser(req, res, next) {
  try {
    const user = await getUser(req.headers.authorization);

    const { currentTier, currentLesson } = user;

    const nextLesson = await findNextLesson(currentTier, currentLesson);

    const updateSuccessful = await updateUserInDatabase(user, nextLesson);

    res.json(updateSuccessful);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  signup,
  login,
  advanceUser,
};
