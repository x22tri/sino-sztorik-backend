import User from '../../models/users.js';
import { getUser } from './utils/getUser.js';
import { updateUserInDatabase } from './utils/updateUserInDatabase.js';
import findNextLesson from './utils/findNextLesson.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { PW_SALT_ROUNDS } from '../../util/config.js';

import {
  VALIDATION_FAILED_ERROR,
  EMAIL_TAKEN_ERROR,
  SIGNUP_FAILED_ERROR,
  WRONG_CREDENTIALS_ERROR,
  LOGIN_FAILED_ERROR,
  ADVANCE_USER_FAILED_ERROR,
} from '../../util/string-literals.js';
import { passError, throwError } from '../../util/functions/throwError.js';
import { Request, Response, NextFunction } from 'express';

async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    if (!validationResult(req).isEmpty()) {
      throwError({ message: VALIDATION_FAILED_ERROR, code: 422 });
    }

    const { displayName, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email: email } });

    if (existingUser) {
      throwError({ message: EMAIL_TAKEN_ERROR, code: 422 });
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

    if (process.env.JWT_KEY === undefined) {
      throw new Error();
    }

    const token = jwt.sign({ userId: createdUser.userId }, process.env.JWT_KEY);

    res.status(201).json({ userId: createdUser.userId, token: token });
  } catch (error) {
    passError(
      { error, fallbackMessage: SIGNUP_FAILED_ERROR, fallbackCode: 500 },
      next
    );
  }
}

async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const identifiedUser = await User.findOne({ where: { email: email } });

    if (!identifiedUser) {
      throwError({ message: WRONG_CREDENTIALS_ERROR, code: 401 });
    }

    const isValidPassword = await bcrypt.compare(
      password,
      identifiedUser.password
    );

    if (isValidPassword === false) {
      throwError({ message: WRONG_CREDENTIALS_ERROR, code: 401 });
    }

    if (process.env.JWT_KEY === undefined) {
      throw new Error();
    }

    const token = jwt.sign(
      { userId: identifiedUser.userId },
      process.env.JWT_KEY
    );

    res.status(200).json({ userId: identifiedUser.userId, token: token });
  } catch (error) {
    passError(
      { error, fallbackMessage: LOGIN_FAILED_ERROR, fallbackCode: 500 },
      next
    );
  }
}

async function advanceUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getUser(req.headers.authorization);

    const { currentTier, currentLesson } = user;

    const nextLesson = await findNextLesson(currentTier, currentLesson);

    const updateSuccessful = await updateUserInDatabase(user, nextLesson);

    res.json(updateSuccessful);
  } catch (error) {
    passError(
      { error, fallbackMessage: ADVANCE_USER_FAILED_ERROR, fallbackCode: 500 },
      next
    );
  }
}

export { signup, login, advanceUser };
