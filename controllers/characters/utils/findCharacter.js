const HttpError = require('../../../models/http-error');

const { findBareCharacter } = require('./findBareCharacter');
const { findSupplements } = require('./findSupplements');

const {
  TIER_OR_LESSON_NOT_NUMBER_ERROR,
} = require('../../../util/string-literals');

/**
 * @typedef {Object} Character
 *
 * @typedef {Object} Progress
 * @property {number} tier The tier the user is currently at.
 * @property {number} lessonNumber The lesson the user is currently at.
 * @property {number} [indexInLesson] The index of the character the user is currently at.
 */

/**
 * Takes the user's current progress and character string and finds the character object for the character
 * based on what the user is eligible to see.
 * The supplementsNeeded flag determines if supplemental information such as phrases with the requested character should be queried.
 *
 * @param {string} charString - The character string we're querying.
 * @param {Progress} userProgress - The user's current progress in the course.
 *
 * @returns {Promise<Character | void>} The character object.
 */
async function findCharacter(charString, userProgress) {
  if (isNaN(userProgress.tier) || isNaN(userProgress.lessonNumber)) {
    throw new HttpError(TIER_OR_LESSON_NOT_NUMBER_ERROR, 400);
  }

  const bareCharacter = await findBareCharacter(charString, userProgress);

  if (!bareCharacter) {
    return;
  }

  const characterWithSupplements = await findSupplements(bareCharacter);

  return characterWithSupplements;
}

module.exports = {
  findCharacter,
};
