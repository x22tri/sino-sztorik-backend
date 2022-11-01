import User from '../../../models/users.js';
import jwt from 'jsonwebtoken';
import {
  UNAUTHENTICATED_ERROR,
  AUTHENTICATION_FAILED_ERROR,
  USER_NOT_FOUND_ERROR,
} from '../../../util/string-literals.js';
import { throwError } from '../../../util/functions/throwError.js';

async function getUser(authHeader) {
  try {
    const token = authHeader.split(' ')[1];

    if (!token) {
      throwError({ message: UNAUTHENTICATED_ERROR, code: 403 });
    }

    if (process.env.JWT_KEY === undefined) {
      throw new Error();
    }

    const decodedToken = jwt.verify(token, process.env.JWT_KEY);

    if (typeof decodedToken === 'string') {
      throw new Error();
    }

    const user = await User.findOne({ where: { userId: decodedToken.userId } });

    if (user) {
      return user;
    }

    throwError({ message: USER_NOT_FOUND_ERROR, code: 404 });
  } catch (error) {
    throwError({ error, message: AUTHENTICATION_FAILED_ERROR, code: 500 });
  }
}

export { getUser };
