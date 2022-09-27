const { Op } = require('sequelize');

const Character = require('../models/characters');
const CharacterOrder = require('../models/character-orders');
const HttpError = require('../models/http-error');

const { getUserData } = require('../util/getUserData');

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
  TIER_OR_LESSON_NOT_NUMBER_ERROR,
  USER_QUERY_FAILED_ERROR,
  DATABASE_QUERY_FAILED_ERROR,
  SEARCH_NO_MATCH,
  SEARCH_NO_ELIGIBLE_MATCH,
} = require('../util/string-literals');
const {
  COURSE_FINISHED_TIER,
  COURSE_FINISHED_LESSON_NUMBER,
} = require('../util/config');

/**
 * @typedef {Object} Character
 */

CharacterOrder.belongsTo(Character, { foreignKey: 'charId' });
Character.hasOne(CharacterOrder, { foreignKey: 'charId' });

/**
 * Takes the user's current progress and character string and finds the character object for the character
 * based on what the user is eligible to see.
 * The supplementsNeeded flag determines if supplemental information such as phrases with the requested character should be queried.
 *
 * @param {number} currentTier - The user's current tier.
 * @param {number} currentLesson - The user's current lesson.
 * @param {string} charString - The character string we're querying.
 * @param {boolean} supplementsNeeded - `true` if supplemental information should be provided in the result, `false` otherwise.
 *
 * @returns {Promise<Character>} The character object.
 */
async function findCharacter(
  currentTier,
  currentLesson,
  charString,
  supplementsNeeded = false
) {
  if (isNaN(currentTier) || isNaN(currentLesson)) {
    throw new HttpError(TIER_OR_LESSON_NOT_NUMBER_ERROR, 404);
  }

  const userProgress = { tier: currentTier, lessonNumber: currentLesson };

  const bareCharacter = await findBareCharacter(userProgress, charString);

  if (supplementsNeeded === false) {
    return bareCharacter;
  }

  const fullCharacter = await findSupplements(bareCharacter);

  return fullCharacter;
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

async function handleForceSearch(searchTerm) {
  const userProgress = {
    tier: COURSE_FINISHED_TIER,
    lessonNumber: COURSE_FINISHED_LESSON_NUMBER,
  };

  return handleSearch(searchTerm, userProgress);
}

function isSearchTermChinese(searchTerm) {
  return /^[一-鿕]+$/u.test(searchTerm);
}

async function findTermAsKeywordOrPrimitive(searchTerm) {
  try {
    const keywordsOrPrimitives = await Character.findAll({
      where: {
        [Op.or]: [{ keyword: searchTerm }, { primitiveMeaning: searchTerm }],
      },
      raw: true,
    });

    if (!keywordsOrPrimitives?.length) {
      throw new HttpError(SEARCH_NO_MATCH, 404);
    } else {
      return keywordsOrPrimitives;
    }
  } catch (err) {
    throw new HttpError(DATABASE_QUERY_FAILED_ERROR, 500);
  }
}

async function findCharByKeywordOrPrimitive(array, userProgress) {
  let foundSearchCharsArray = [];

  for (const keywordOrPrimitive of array) {
    const foundSearchChar = await findCharacter(
      userProgress.tier,
      userProgress.lessonNumber,
      keywordOrPrimitive.charChinese,
      true
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

async function handleSearch(searchTerm, userProgress) {
  userProgress.lessonNumber = userProgress.lessonNumber - 1; // User isn't eligible to the upcoming lesson in a search request.

  if (isSearchTermChinese(searchTerm)) {
    const foundSearchChar = await findCharacter(
      userProgress.tier,
      userProgress.lessonNumber,
      searchTerm,
      true
    );

    return foundSearchChar;
  }

  const keywordsOrPrimitives = await findTermAsKeywordOrPrimitive(searchTerm);
  const foundChars = await findCharByKeywordOrPrimitive(
    keywordsOrPrimitives,
    userProgress
  );

  return foundChars;
}

module.exports = {
  findCharacter,
  findSupplements,
  handleSearch,
};
