// Setting up custom object properties.
import { INVALID_NUMBERS_PROVIDED } from './string-literals.js';

function addMethods(object, methods) {
  methods.forEach(method =>
    Object.defineProperty(object, method.name, { value: method })
  );

  return;
}

/**
 * A method that compares two progress states (objects that have "tier", "lessonNumber" and optionally "indexInLesson" properties).
 * These can be entries from the CharacterOrders table, or objects with the user's current tier and lessonNumber.
 *
 * @param {Progress} secondState - The progress state against which you'd like to compare the object this method was called on.
 * @returns {boolean} `true` if the object this method was called on comes later than `secondState`, `false` otherwise.
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
    firstState.indexInLesson > secondState.indexInLesson
  ) {
    return true;
  }

  return false;
}

/**
 * In an array of objects containing a nested object, modifies the objects by extracting the nested object into the main object.
 * Use after a Sequelize query with an "include" parameter.
 *
 * @param {string} field - The name of the property which contains the nested object.
 * @returns {void} Modifies `this` to now have the nested property extracted to the main object.
 *
 * ---
 *
 * When Sequelize queries are made with the "include" parameter,
 * the included (outer joined) table is placed into a nested object with the table's name.
 *
 * If, for example, the query is `CharacterOrder.findAll({include: [Character]})`,
 * the returned `characterOrder` object will have a `characters` field,
 * containing an object with the queried character's data.
 *
 * This function extracts the nested object (bearing the property name in the `field` argument)
 * and adds its content to the main object.
 */
function hoistField(field) {
  for (let i = 0; i < this.length; i++) {
    this[i] = { ...this[i], ...this[i][field] };

    delete this[i][field];
  }

  return;
}

/**
 * In an array of objects, filters out duplicates based on the given field.
 * In other words, for objects where the given field's value is the same, it will only keep the first one found.
 *
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

export { addMethods, comesLaterThan, hoistField, filterByField };
