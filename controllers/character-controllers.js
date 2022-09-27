const Character = require('../models/characters');
const CharacterOrder = require('../models/character-orders');
const HttpError = require('../models/http-error');

const {
  findBareCharacter,
} = require('./character-controllers-utils/findBareCharacter');
const { findSimilars } = require('./character-controllers-utils/findSimilars');
const { findPhrases } = require('./character-controllers-utils/findPhrases');
const {
  findOtherUses,
} = require('./character-controllers-utils/findOtherUses');
const {
  findConstituents,
} = require('./character-controllers-utils/findConstituents');
const {
  findTermAsKeywordOrPrimitive,
} = require('./character-controllers-utils/findTermAsKeywordOrPrimitive');

const {
  TIER_OR_LESSON_NOT_NUMBER_ERROR,
  SEARCH_NO_ELIGIBLE_MATCH,
} = require('../util/string-literals');

/**
 * @typedef {Object} Character
 *
 * @typedef {Object} Progress
 * @property {number} tier The tier the user is currently at.
 * @property {number} lessonNumber The lesson the user is currently at.
 * @property {number} [indexInLesson] The index of the character the user is currently at.
 */

CharacterOrder.belongsTo(Character, { foreignKey: 'charId' });
Character.hasOne(CharacterOrder, { foreignKey: 'charId' });

/**
 * Takes the user's current progress and character string and finds the character object for the character
 * based on what the user is eligible to see.
 * The supplementsNeeded flag determines if supplemental information such as phrases with the requested character should be queried.
 *
 * @param {string} charString - The character string we're querying.
 * @param {Progress} userProgress - The user's current progress in the course.
 *
 * @returns {Promise<Character>} The character object.
 */
async function findCharacter(charString, userProgress) {
  if (isNaN(userProgress.tier) || isNaN(userProgress.lessonNumber)) {
    throw new HttpError(TIER_OR_LESSON_NOT_NUMBER_ERROR, 400);
  }

  const bareCharacter = await findBareCharacter(charString, userProgress);

  const characterWithSupplements = await findSupplements(bareCharacter);

  return characterWithSupplements;
}

/**
 * Takes a character object and finds all supplemental information about it:
 * other characters that are similar (either in appearance or meaning),
 * phrases with the character, the character's other uses,
 * and the character objects of all its constituents.
 *
 * @param {Character} char - The character object whose supplements we're querying.
 * @returns {Promise<Character>} The character object, complete with supplemental information.
 */
async function findSupplements(char) {
  const similars = await findSimilars(char);
  const phrases = await findPhrases(char);
  const otherUses = await findOtherUses(char);
  const constituents = await findConstituents(char);

  return {
    ...char,
    similars,
    phrases,
    otherUses,
    constituents,
  };
}

async function handleSearch(searchTerm, userProgress) {
  userProgress.lessonNumber = userProgress.lessonNumber - 1; // User isn't eligible to the upcoming lesson in a search request.

  if (isSearchTermChinese(searchTerm)) {
    const foundSearchChar = await findCharacter(searchTerm, userProgress);

    return foundSearchChar;
  }

  const keywordsOrPrimitives = await findTermAsKeywordOrPrimitive(searchTerm);
  const foundChars = await findCharByKeywordOrPrimitive(
    keywordsOrPrimitives,
    userProgress
  );

  return foundChars;
}

async function findCharByKeywordOrPrimitive(array, userProgress) {
  let foundSearchCharsArray = [];

  for (const keywordOrPrimitive of array) {
    const foundSearchChar = await findCharacter(
      keywordOrPrimitive.charChinese,
      userProgress
    );

    if (foundSearchChar) {
      foundSearchCharsArray.push(foundSearchChar);
    }
  }

  if (!foundSearchCharsArray.length) {
    throw new HttpError(SEARCH_NO_ELIGIBLE_MATCH, 401);
  } else {
    return foundSearchCharsArray;
  }
}

function isSearchTermChinese(searchTerm) {
  return /^[一-鿕]+$/u.test(searchTerm);
}

module.exports = {
  findCharacter,
  findSupplements,
  handleSearch,
};
