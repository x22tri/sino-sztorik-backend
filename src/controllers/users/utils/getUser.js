import User from '../../../models/users.js';
import HttpError from '../../../models/http-error.js';
import jwt from 'jsonwebtoken';
import {
  UNAUTHENTICATED_ERROR,
  AUTHENTICATION_FAILED_ERROR,
  USER_NOT_FOUND_ERROR,
} from '../../../util/string-literals.js';

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

export { getUser };
