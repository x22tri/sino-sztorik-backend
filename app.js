const express = require('express');
const cors = require('cors');
const router = require('./util/router');
const {
  headerConfiguration,
  unsupportedRouteHandler,
  errorHandler,
} = require('./util/middleware');

require('dotenv').config();

const database = require('./util/database');
const app = express();

app.use(cors());
app.use(headerConfiguration);
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
