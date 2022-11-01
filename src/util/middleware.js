import { throwError } from './functions/throwError.js';
import { UNSUPPORTED_ROUTE_ERROR, UNKNOWN_ERROR } from './string-literals.js';

const unsupportedRouteHandler = () => {
  throwError({
    message: UNSUPPORTED_ROUTE_ERROR,
    code: 404,
  });
};

const errorHandler = (error, _, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || UNKNOWN_ERROR });
};

export { unsupportedRouteHandler, errorHandler };
