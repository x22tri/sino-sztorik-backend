const express = require('express');
const { check } = require('express-validator');
const {
  signup,
  login,
  advanceUser,
} = require('./controllers/user-controllers');

const userRoutes = require('./routes/user-routes');
const lessonRoutes = require('./routes/lesson-routes');
const characterRoutes = require('./routes/character-routes');
const adminRoutes = require('./routes/admin-routes');
const HttpError = require('./models/http-error');
const {
  UNSUPPORTED_ROUTE_ERROR,
  UNKNOWN_ERROR,
} = require('./util/string-literals');

const app = express();

const sequelize = require('./util/database');

require('dotenv').config();

// Adding headers before the routes are defined.
app.use((req, res, next) => {
  const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:3000'];

  const { origin } = req.headers;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );

  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With, Content-Type, Authorization'
  );

  next();
});

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/learn', lessonRoutes);
app.use('/api/review/:charID', lessonRoutes);
app.use('/api/char', characterRoutes);
app.use('/api/search', characterRoutes);
app.use('/api/force-search', characterRoutes);
app.use('/api/admin', adminRoutes);

// Error handler for unsupported routes. Needs to be the last path in the list.
app.use(() => {
  throw new HttpError(UNSUPPORTED_ROUTE_ERROR, 404);
});

// Error handler for thrown errors.
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || UNKNOWN_ERROR });
});

sequelize
  .sync({ alter: true })
  .then(result => {
    app.listen(process.env.PORT || 5000);
  })
  .catch(err => {
    console.log(err);
  });
