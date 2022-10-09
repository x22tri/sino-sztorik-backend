import HttpError from '../models/http-error.js';
import { UNSUPPORTED_ROUTE_ERROR, UNKNOWN_ERROR } from './string-literals.js';

const unsupportedRouteHandler = () => {
  throw new HttpError(UNSUPPORTED_ROUTE_ERROR, 404);
};

const errorHandler = (error, _, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || UNKNOWN_ERROR });
};

export { unsupportedRouteHandler, errorHandler };
