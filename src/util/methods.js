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

export { addMethods, comesLaterThan };
