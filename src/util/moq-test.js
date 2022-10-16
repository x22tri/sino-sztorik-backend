/*

Foo.findAll({
  where: {
    rank: {
      [Op.or]: {
        [Op.lt]: 1000,
        [Op.eq]: null,
      },
    },
    // rank < 1000 OR rank IS NULL

    createdAt: {
      [Op.lt]: new Date(),
      [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000),
    },

    // createdAt < [timestamp] AND createdAt > [timestamp]

    [Op.or]: [
      {
        title: {
          [Op.like]: 'Boat%',
        },
      },
      {
        description: {
          [Op.like]: '%boat%',
        },
      },
    ],

    // title LIKE 'Boat%' OR description LIKE '%boat%'
  },
});

item => item['rank'] < 1000 || item['rank'] === null;
item =>
  item['createdAt'] < new Date() &&
  item['createdAt'] > new Date(new Date() - 24 * 60 * 60 * 1000); // object length > 1 is an AND query!
item => like('Boat%', item['title']) || like('%boat%', item['description']);

// number of functions equals the number of entries in Object.entries(where), unless &&'s are split up to separate functions
// convert to [Op.and] ?

// step 1: traverse the function
// wherever there is a right hand side (object value) with length more than 1, and it is not an OR query, that is an AND query
// whenever left (property) is string (not symbol) and right (value) is primitive (string or number), that is Op.eq

// [Op.and] right hand side: connect with &&, surround with parentheses
// [Op.or] right hand side: if array, for each element: parent property === item || parent property === item2 etc.
// else: connect with ||, surround with parentheses

// if a property contains property [Op.like], convert to like(property[Op.like], property)
// if a property contains property [Op.notLike], convert to !(like(property[Op.notLike], property))

// [Op.not] right hand side: surround with !()

//

Project.findAll({
  where: {
    name: 'Some Project',
    [Op.not]: [
      { id: [1, 2, 3] },
      {
        description: {
          [Op.like]: 'Hello%',
        },
      },
    ],
  },
});

item => item['name'] === 'Some Project';
!(item =>
  [1, 2, 3].includes(item['id']) && like('Hello%', item['description']));

function like(string, valueToTest) {
  string = string.endsWith('%') ? string.slice(0, -1) : string + '\b';
  string = string.startsWith('%') ? string.slice(1) : '\b' + string;
  return new RegExp(string).test(valueToTest);
}

*/

/*
 */

/*

function findFilter(operator, property, value, currentQuery = undefined) {
  const operatorDictionary = {
    [Symbol.for('eq')]: item => item[property] === value,
    [Symbol.for('gt')]: item => item[property] > value,
    [Symbol.for('lt')]: item => item[property] < value,
    // [Symbol.for('not')]: !(toCompare === value),
  };

  if (operatorDictionary[operator]) {
    currentQuery = operatorDictionary[operator];
  } else if (operator === Symbol.for('not')) {
    // provided [not] is not used with a primitive value, in which case it is just "not equal"
    function not(func) {
      return function () {
        return !func.apply(this, arguments);
      };
    }

    currentQuery = not(currentQuery);
  }

  return currentQuery;
}

let a = {
  rank: {
    [Symbol.for('not')]: {
      [Symbol.for('lt')]: 200,
    },
    // [Symbol.for('lt')]: 1000,
  },
};

function _gatherQueries(object, state) {
  if (state.functions.getObjLength(object) > 1) {
    throw new Error('AND/OR query Not supported yet');
  }

  let left = state.functions.getLeft(object);
  let right = object[left];

  if (typeof left !== 'symbol') {
    if (left === state.currentProperty) {
      state.queryArray.push(state.currentQuery);
      // currentProperty = undefined; // To-Do: next property
      state.goingUp = false;
      return;
    } else {
      state.currentProperty = left;
    }
  }

  if (typeof right !== 'object' || state.goingUp) {
    let q = findFilter(
      left,
      state.currentProperty,
      state.currentQuery || right,
      state.currentQuery
    );
    state.currentQuery = q;
    state.goingUp = true;
  }

  let objToCheck;

  if (state.goingUp) {
    state.nestingLevel--;
    objToCheck = state.functions.getParent(state);
  } else {
    state.nestingLevel++;
    objToCheck = right;
  }

  // console.log(state);

  _gatherQueries(objToCheck, state);

  return state.queryArray;
}

function gatherQueries(object) {
  const functions = {
    getKeys(obj) {
      return Reflect.ownKeys(obj);
    },

    getLeft(obj) {
      return this.getKeys(obj)[0];
    },

    getObjLength(obj) {
      return this.getKeys(obj).length;
    },

    getParent({ nestingLevel }) {
      let x = object;
      for (let i = 0; i < nestingLevel; i++) {
        x = x[this.getLeft(object)];
      }
      return x;
    },
  };

  return _gatherQueries(object, {
    currentProperty: undefined,
    currentQuery: undefined,
    functions,
    goingUp: false,
    nestingLevel: 0,
    originalObject: { ...object },
    queryArray: [],
  });
}

function testGatherQueries() {
  let x = gatherQueries(a);

  item => !(item['rank'] < 200) || item['rank'] === 1001;

  // when find left hand side which is a string (not symbol), save it as 'currentProperty'
  // find nearest right hand side with a primitive (string, number - perhaps array?) - save it as 'currentValue'
  // construct query going up: item['currentProperty'] [operator] currentValue - go up one until left is 'currentProperty'

  let tarr = [{ rank: 1 }, { rank: 2 }, { rank: 1000 }, { rank: 1000 }].filter(
    item =>
      x.every(func => {
        console.log(func);
        return func(item);
      })
  );

  console.log(tarr);
}

export { testGatherQueries };

*/
