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

// experimentation starts here

/*

let arr = [];

function findFilter(operator, property, value) {
  const operatorDictionary = {
    [Symbol.for('eq')]: item => item[property] === value,
    [Symbol.for('gt')]: item => item[property] > value,
    [Symbol.for('lt')]: item => item[property] < value,
  };

  return operatorDictionary[operator];
}

function hm(object, parent = { where: object }) {
  // console.log('object:');
  // console.log(object);
  // console.log('parent:');
  // console.log(parent);
  const getLeft = obj => Reflect.ownKeys(obj)[0];
  const getObjLength = obj => Reflect.ownKeys(obj).length;

  let left = getLeft(object);
  let right = object[left];

  if (typeof right === 'object' && !Array.isArray(right)) {
    let objLength = getObjLength(right);
    if (objLength > 1) {
      if (left === Symbol.for('or')) {
        let orQueryParams = [];
        for (let i = 0; i < objLength; i++) {
          let childLeft = Reflect.ownKeys(right)[i];
          let childRight = right[childLeft];

          orQueryParams.push(
            findFilter(childLeft, getLeft(parent), childRight)
          );
        }

        arr.push(item => orQueryParams.some(func => func(item)));
      }
    }

    return hm(right, object);
  } else {
    // if primitive
    if (left === Symbol.for('eq')) {
      arr.push(item => item[getLeft(parent)] === right);
    }
    return;
  }
}

hm({
  rank: {
    [Symbol.for('or')]: {
      // [Symbol.for('not')]: {
      //   [Symbol.for('lt')]: 200,
      // },
      [Symbol.for('lt')]: 200,
      [Symbol.for('eq')]: 1001,
      // [Symbol.for('gt')]: 5000,
    },
    // [Symbol.for('lt')]: 5000,
    // [Symbol.for('gt')]: 100,
  },
});

// console.log(String(arr));

let tarr = [{ rank: 1 }, { rank: 2 }, { rank: 1000 }, { rank: 1000 }].filter(
  item => arr.every(func => func(item))
);

console.log(tarr);

*/

// experimentation ends here

database
  .sync({ alter: true })
  .then(result => {
    app.listen(process.env.PORT || 5000);
  })
  .catch(err => {
    console.log(err);
  });
