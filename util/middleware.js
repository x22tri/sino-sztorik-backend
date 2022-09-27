const HttpError = require('../models/http-error');
const { UNSUPPORTED_ROUTE_ERROR, UNKNOWN_ERROR } = require('./string-literals');

require('dotenv').config();

const headerConfiguration = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL);

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With, Content-Type, Authorization'
  );

  next();
};

const unsupportedRouteHandler = () => {
  throw new HttpError(UNSUPPORTED_ROUTE_ERROR, 404);
};

const errorHandler = (error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || UNKNOWN_ERROR });
};

module.exports = {
  headerConfiguration,
  unsupportedRouteHandler,
  errorHandler,
};
