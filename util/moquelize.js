const firstBy = require('thenby');

function isObject(value) {
  return typeof value === 'object' && !Array.isArray(value) && value !== null;
}

function gatherFindParams(where) {
  if (!where || where === {}) {
    return {};
  }

  let whereParams = {};

  Object.entries(where).forEach(([property, value], index) => {
    if (!isObject(value)) {
      whereParams[index] = item => item[property] === value;
    }

    // Sequelize stores operators in symbol format.
    if (isObject(value)) {
      let [[operator, nestedValue]] = Reflect.ownKeys(value).map(key => [
        key,
        value[key],
      ]);

      //Op.and, Op.or - need special treatment!

      const operatorDictionary = {
        [Symbol.for('eq')]: item => item[property] === nestedValue,
        [Symbol.for('ne')]: item => item[property] !== nestedValue,
        [Symbol.for('gt')]: item => item[property] > nestedValue,
        [Symbol.for('gte')]: item => item[property] >= nestedValue,
        [Symbol.for('lt')]: item => item[property] < nestedValue,
        [Symbol.for('lte')]: item => item[property] <= nestedValue,
        [Symbol.for('between')]: item =>
          item[property] > nestedValue[0] && item[property] < nestedValue[1],
        [Symbol.for('notBetween')]: item =>
          !(item[property] > nestedValue[0] && item[property] < nestedValue[1]),
        [Symbol.for('in')]: item => nestedValue.includes(item[property]),
        [Symbol.for('notIn')]: item => !nestedValue.includes(item[property]),
        [Symbol.for('like')]: item => nestedValue.includes(item[property]),
        [Symbol.for('notLike')]: item => !nestedValue.includes(item[property]),
        [Symbol.for('startsWith')]: item =>
          nestedValue.startsWith(item[property]),
        [Symbol.for('endsWith')]: item => nestedValue.endsWith(item[property]),
      };

      if (!operatorDictionary[operator]) {
        throw new Error(`Moquelize does not support the operator ${operator} at this time.
              We apologize for the inconvenience.`);
      }

      whereParams[index] = operatorDictionary[operator];
    }
  });

  return whereParams;
}

function moquelize(testData) {
  return {
    findAll({ where, order }) {
      let whereParams = gatherFindParams(where);

      let filteredData = testData.filter(item =>
        Object.values(whereParams).every(query => query(item))
      );

      if (!order?.length) {
        () => {};
      }

      let sortStack = firstBy(() => 0);

      order.forEach(property => (sortStack = sortStack.thenBy([property])));

      filteredData.sort(sortStack);

      // console.log(filteredData);

      return filteredData;
    },
  };
}

module.exports = moquelize;
