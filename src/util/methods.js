// Setting up custom object properties.
import { INVALID_NUMBERS_PROVIDED } from './string-literals.js';

function addMethods(object, methods) {
  methods.forEach(method =>
    Object.defineProperty(object, method.name, { value: method })
  );

  return;
}

/**
 * @typedef {Object} Character
 *
 * @typedef {Object} Progress
 * @property {number} tier The tier the user is currently at.
 * @property {number} lessonNumber The lesson the user is currently at.
 * @property {number} [indexInLesson] The index of the character the user is currently at.
 * /

/**
 * A method that compares two progress states (objects that have "tier", "lessonNumber" and optionally "indexInLesson" properties).
 * These can be entries from the CharacterOrders table, or objects with the user's current tier and lessonNumber.
 *
 * @this {Progress} - The progress state to compare.
 * @param {Progress} secondState - The progress state against which you'd like to compare the object this method was called on.
 * @returns {boolean} `true` if the object this method was called on comes later than `secondState`, `false` otherwise.
 * 
 */
function comesLaterThan(secondState) {
  const firstState = Object(this).valueOf();

  if (
    !(
      Number.isInteger(firstState.tier) &&
      Number.isInteger(secondState.tier) &&
      Number.isInteger(firstState.lessonNumber) &&
      Number.isInteger(secondState.lessonNumber)
    )
  ) {
    throw new Error(INVALID_NUMBERS_PROVIDED);
  }

  if (
    (firstState.indexInLesson && !Number.isInteger(firstState.indexInLesson)) ||
    (secondState.indexInLesson && !Number.isInteger(secondState.indexInLesson))
  ) {
    throw new Error(INVALID_NUMBERS_PROVIDED);
  }

  if (firstState.tier > secondState.tier) {
    return true;
  }

  if (
    firstState.tier === secondState.tier &&
    firstState.lessonNumber > secondState.lessonNumber
  ) {
    return true;
  }

  if (
    firstState.tier === secondState.tier &&
    firstState.lessonNumber === secondState.lessonNumber &&
    firstState.indexInLesson &&
    secondState.indexInLesson &&
    firstState.indexInLesson > secondState.indexInLesson
  ) {
    return true;
  }

  return false;
}

/**
 * In an array of objects, filters out duplicates based on the given field.
 * In other words, for objects where the given field's value is the same, it will only keep the first one found.
 *
 * @this {object[]}
 * @param {string} field - The name of the property based on which to filter.
 * @returns {void} Modifies `this` into a filtered array.
 */
function filterByField(field) {
  let obj = {};

  for (let i = 0; i < this.length; i++) {
    if (!this[i] || !this[i][field]) {
      continue;
    }

    if (obj[this[i][field]]) {
      this.splice(i, 1);
    } else {
      obj[this[i][field]] = true;
    }
  }

  obj = {};

  return;
}

/**
 * Runs a Sequelize `findAll` query with an `include` parameter,
 * then extracts the nested object created by said `include` command into the main object.
 *
 * @this {{findAll: Function}} - A Sequelize model.
 * @param {object} query - The configuration of the `findAll` query.
 * @returns {Promise<object[]>} The result of the query.
 *
 * ---
 *
 * When Sequelize queries are made with the `include` parameter,
 * the included (outer joined) table is placed into a nested object with the model's name.
 *
 * If, for example, the query is `CharacterOrder.findAll({include: [Character]})`,
 * the returned `characterOrder` object will have a `character` field,
 * containing an object with the queried character's data.
 *
 * This function extracts the nested object and adds its content to the main object.
 */
async function findAllAndFlatten(query) {
  if (!this.findAll || !query?.include || query.include.length !== 1) {
    throw new Error(
      `This method can only be called on a Sequelize model instance, in place of findAll.
        It requires an 'include' parameter with a value of an array containing a single field.`
    );
  }

  const fieldToHoist = query.include[0].options.name.singular;

  let queryResults = await this.findAll(query);

  for (let i = 0; i < queryResults.length; i++) {
    queryResults[i] = { ...queryResults[i], ...queryResults[i][fieldToHoist] };

    delete queryResults[i][fieldToHoist];
  }

  return queryResults;
}

export { addMethods, comesLaterThan, filterByField, findAllAndFlatten };
