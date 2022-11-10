import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { HttpError, throwError } from './functions/throwError.js';
import { UNSUPPORTED_ROUTE_ERROR, UNKNOWN_ERROR } from './string-literals.js';

const unsupportedRouteHandler = () => {
  throwError({
    message: UNSUPPORTED_ROUTE_ERROR,
    code: 404,
  });
};

const errorHandler: ErrorRequestHandler = (
  error: HttpError,
  _: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || UNKNOWN_ERROR });
};

export { unsupportedRouteHandler, errorHandler };
