const HttpError = require('../models/http-error');
const { UNSUPPORTED_ROUTE_ERROR, UNKNOWN_ERROR } = require('./string-literals');

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

module.exports = {
  unsupportedRouteHandler,
  errorHandler,
};
