const initializeSortStack = (function () {
  function compare(field, descending) {
    let f = (a, b) => (a[field] < b[field] ? -1 : a[field] > b[field] ? 1 : 0);
    return descending ? -f : f;
  }

  function addToSort(field, descending) {
    let f = () => 0;
    f.addToSort = addToSort;

    if (!field) {
      return f;
    } else {
      f = (a, b) => this(a, b) || compare(field, descending)(a, b);
      return f;
    }
  }

  return addToSort;
})();

function isObject(value) {
  return typeof value === 'object' && !Array.isArray(value) && value !== null;
}

function gatherWhereParams(where) {
  if (!where || where === {}) {
    return {};
  }

  let whereParams = [];

  Object.entries(where).forEach(([property, value]) => {
    // Shorthand syntax for [Op.in].
    if (Array.isArray(value)) {
      whereParams.push(item => value.includes(item[property]));
    }

    // Shorthand syntax for [Op.eq].
    if (!isObject(value)) {
      whereParams.push(item => item[property] === value);
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

      whereParams.push(operatorDictionary[operator]);
    }
  });

  return whereParams;
}

function orderFilteredData(filteredData, order) {
  if (!order?.length) {
    return filteredData;
  }

  let sortStack = initializeSortStack();

  order.forEach(property => (sortStack = sortStack.addToSort(property)));

  filteredData.sort(sortStack);

  return filteredData;
}

function moquelize(data) {
  return {
    findAll({ where, order }) {
      try {
        const whereParams = gatherWhereParams(where);

        const filtered = data.filter(item =>
          whereParams.every(func => func(item))
        );

        const sorted = orderFilteredData(filtered, order);

        return sorted;
      } catch (err) {
        throw new Error(err);
      }
    },

    findOne({ where }) {
      try {
        const whereParams = gatherWhereParams(where);

        const found = data.find(item => whereParams.every(func => func(item)));

        return found;
      } catch (err) {
        throw new Error(err);
      }
    },

    count({ where }) {
      const whereParams = gatherWhereParams(where);

      let filtered = data.filter(item => whereParams.every(func => func(item)));

      return filtered.length;
    },

    min(field, { where }) {
      let sorted = this.findAll({ where, order: [[field]] });
      return sorted[0];
    },

    max(field, { where }) {
      let sorted = this.findAll({ where, order: [[field]] });
      return sorted[sorted.length - 1];
    },
  };
}

export default moquelize;
