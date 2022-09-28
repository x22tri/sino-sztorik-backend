const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { getUser } = require('../util/getUserData');

const User = require('../models/users');
const CharacterOrder = require('../models/character-orders');
const HttpError = require('../models/http-error');

const {
  LAST_TIER,
  COURSE_FINISHED_TIER,
  COURSE_FINISHED_LESSON_NUMBER,
  PW_SALT_ROUNDS,
} = require('../util/config');

const {
  NO_LESSON_FOUND_IN_SAME_TIER_ERROR,
  NO_LESSON_FOUND_IN_NEXT_TIER_ERROR,
  NEXT_LESSON_NOT_FOUND_ERROR,
  ADVANCE_USER_FAILED_ERROR,
  WRONG_CREDENTIALS_ERROR,
  VALIDATION_FAILED_ERROR,
  EMAIL_TAKEN_ERROR,
  SIGNUP_FAILED_ERROR,
  LOGIN_FAILED_ERROR,
} = require('../util/string-literals');

const signup = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    throw new HttpError(VALIDATION_FAILED_ERROR, 422);
  }

  const { displayName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email: email } });

    if (existingUser) {
      throw new HttpError(EMAIL_TAKEN_ERROR, 422);
    }

    let createdUser;
    try {
      const hashedPassword = await bcrypt.hash(password, PW_SALT_ROUNDS);
      createdUser = await User.create({
        //userId is autoIncrementing, created automatically by Sequelize
        displayName,
        email,
        password: hashedPassword,
        currentTier: 1,
        currentLesson: 1,
      });
    } catch (err) {
      throw new HttpError(SIGNUP_FAILED_ERROR, 500);
    }

    const token = jwt.sign({ userId: createdUser.userId }, process.env.JWT_KEY);

    res.status(201).json({ userId: createdUser.userId, token: token });
  } catch (err) {
    throw new HttpError(err, 500);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const identifiedUser = await User.findOne({ where: { email: email } });

    if (!identifiedUser) {
      throw new HttpError(WRONG_CREDENTIALS_ERROR, 401);
    }

    try {
      const isValidPassword = await bcrypt.compare(
        password,
        identifiedUser.password
      );

      if (isValidPassword === false) {
        throw new HttpError(WRONG_CREDENTIALS_ERROR, 401);
      }
    } catch (err) {
      throw new HttpError(LOGIN_FAILED_ERROR, 500);
    }

    const token = jwt.sign(
      { userId: identifiedUser.userId },
      process.env.JWT_KEY
    );

    res.status(200).json({ userId: identifiedUser.userId, token: token });
  } catch (err) {
    throw new HttpError(err, 500);
  }
};

const advanceUser = async (req, res, next) => {
  try {
    const user = await getUser(req.headers.authorization);

    const { currentTier, currentLesson } = user;

    const lessonQuery = await findNextLesson(currentTier, currentLesson);

    const { success, result } = lessonQuery;

    if (success) {
      await user.update({
        currentTier: result.tier,
        currentLesson: result.lessonNumber,
      });
    }

    res.json(lessonQuery);
  } catch (err) {
    throw new HttpError(err || ADVANCE_USER_FAILED_ERROR, 500);
  }
};

const findNextLesson = async (currentTier, currentLesson) => {
  let lessonQuery = {};

  lessonQuery = await tryFindLessonInSameTier(currentTier, currentLesson);

  if (lessonQuery.success) {
    return lessonQuery;
  }

  lessonQuery = await tryFindLessonInNextTier(currentTier);

  if (lessonQuery.success) {
    return lessonQuery;
  }

  if (currentTier === LAST_TIER) {
    return {
      success: true,
      result: {
        tier: COURSE_FINISHED_TIER,
        lessonNumber: COURSE_FINISHED_LESSON_NUMBER,
      },
    };
  }

  return {
    success: false,
    message: NEXT_LESSON_NOT_FOUND_ERROR,
  };
};

const tryFindLessonInSameTier = async (currentTier, currentLesson) => {
  const remainingLessonsInTier = await CharacterOrder.findAll({
    where: { tier: currentTier, lessonNumber: { [Op.gt]: currentLesson } },
    order: ['lessonNumber'],
  });

  const nextLessonInSameTier = remainingLessonsInTier?.[0];

  return nextLessonInSameTier
    ? {
        success: true,
        result: {
          tier: nextLessonInSameTier.tier,
          lessonNumber: nextLessonInSameTier.lessonNumber,
        },
      }
    : { success: false, message: NO_LESSON_FOUND_IN_SAME_TIER_ERROR };
};

const tryFindLessonInNextTier = async currentTier => {
  const lessonsInNextTier = await CharacterOrder.findAll({
    where: { tier: currentTier + 1 },
    order: ['lessonNumber'],
  });

  const firstLessonInNextTier = lessonsInNextTier?.[0];

  return firstLessonInNextTier
    ? {
        success: true,
        result: {
          tier: firstLessonInNextTier.tier,
          lessonNumber: firstLessonInNextTier.lessonNumber,
        },
      }
    : { success: false, message: NO_LESSON_FOUND_IN_NEXT_TIER_ERROR };
};

module.exports = {
  signup,
  login,
  advanceUser,
};
