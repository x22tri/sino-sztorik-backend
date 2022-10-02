const express = require('express');
const cors = require('cors');
const { unsupportedRouteHandler, errorHandler } = require('./util/middleware');
const router = require('./util/router');
const database = require('./util/database');
const app = express();

require('dotenv').config();
require('./util/setup');

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(router);
app.use(unsupportedRouteHandler);
app.use(errorHandler);

database
  .sync({ alter: true })
  .then(result => {
    app.listen(process.env.PORT || 5000);
  })
  .catch(err => {
    console.log(err);
  });
