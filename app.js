import express from 'express';
import cors from 'cors';
import { unsupportedRouteHandler, errorHandler } from './util/middleware.js';
import router from './util/router.js';
import database from './util/database.js';
// import { testGatherQueries } from './util/moq-test'

const app = express();

import { config } from 'dotenv';
config();
import './util/setup.js';

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(router);
app.use(unsupportedRouteHandler);
app.use(errorHandler);

// testGatherQueries();

database
  .sync({ alter: true })
  .then(result => {
    app.listen(process.env.PORT || 5000);
  })
  .catch(err => {
    console.log(err);
  });
