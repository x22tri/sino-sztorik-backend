const { Op } = require('sequelize');

const Character = require('../models/characters');
const CharacterOrder = require('../models/character-orders');
const HttpError = require('../models/http-error');

const getUserData = require('../util/getUserData');

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
 * @param {string} char - The character string we're querying.
 * @param {boolean} supplementsNeeded - `true` if supplemental information should be provided in the result, `false` otherwise.
 * @returns {Promise<Character>} The character object.
 */
async function findCharacter(
  currentTier,
  currentLesson,
  char,
  supplementsNeeded = false
) {
  if (isNaN(currentTier) || isNaN(currentLesson)) {
    throw new HttpError(TIER_OR_LESSON_NOT_NUMBER_ERROR, 404);
  }

  const userProgress = { tier: currentTier, lessonNumber: currentLesson };

  const bareCharacter = await findBareCharacter(userProgress, char);

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

// A function that checks if the request arrived here from the search function in LessonSelect
// (in which case the :charChinese parameter may be a Chinese character, a keyword or a primitiveMeaning),
// or elsewhere (in which case it should only be a Chinese character).
const checkIfSearch = async (req, res, next) => {
  // Gets the type of request, i.e. what comes after "api/".
  // Is either "/char/:charChinese", "/search/:charChinese", or "/force-search/:charChinese", or else the request doesn't arrive here.
  let requestType = req.originalUrl.split('/')[2];
  let requestedChar = req.params.charChinese;

  // Gets the user info to customize the shown character for the user,
  // unless this is a "force search" request, in which case all info should be shown.
  let user, currentTier, currentLesson;
  if (requestType === 'force-search') {
    currentTier = COURSE_FINISHED_TIER;
    currentLesson = COURSE_FINISHED_LESSON_NUMBER;
  } else {
    try {
      user = await getUserData(req, res, next);
      currentTier = user.currentTier;
      currentLesson = user.currentLesson;
    } catch (err) {
      return next(new HttpError(USER_QUERY_FAILED_ERROR, 500));
    }
  }

  if (requestType === 'search' || requestType === 'force-search') {
    // If this is a search or force-search request, the user should not be eligible to the upcoming lesson.
    currentLesson--;
    // All characters in the string must be in the Unicode CJK Unified Ideographs block.
    const chineseCharUnicodeRegex = /^[一-鿕]+$/u;

    // If we've recognized the search term as a Chinese character
    if (chineseCharUnicodeRegex.test(requestedChar)) {
      let foundSearchChar = await findCharacter(
        currentTier,
        currentLesson,
        requestedChar,
        true
      );
      if (foundSearchChar) {
        if (foundSearchChar.code)
          return next(foundSearchChar); // If there was an error, throw it.
        else res.json(foundSearchChar);
      }
    } else {
      // If we've recognized the search term as non-Chinese characters, it must be Latin (and thus a keyword/primitive).
      let keywordOrPrimitive;
      try {
        keywordOrPrimitive = await Character.findAll({
          where: {
            [Op.or]: [
              { keyword: requestedChar },
              { primitiveMeaning: requestedChar },
            ],
          },
        });
        if (!keywordOrPrimitive || !keywordOrPrimitive.length) {
          return next(new HttpError(SEARCH_NO_MATCH, 404));
        } else {
          let foundSearchCharsArray = [];
          for (let i = 0; i < keywordOrPrimitive.length; i++) {
            requestedChar = keywordOrPrimitive[i].dataValues.charChinese;
            let foundSearchChar = await findCharacter(
              currentTier,
              currentLesson,
              requestedChar,
              true
            );
            if (foundSearchChar && !foundSearchChar.code) {
              foundSearchCharsArray.push(foundSearchChar);
            }
          }
          if (!foundSearchCharsArray.length) {
            return next(new HttpError(SEARCH_NO_ELIGIBLE_MATCH, 401));
          } else {
            res.json(foundSearchCharsArray);
          }
        }
      } catch (err) {
        return new HttpError(DATABASE_QUERY_FAILED_ERROR, 500);
      }
    }
  } else {
    findCharacter(currentTier, currentLesson, requestedChar, true);
  }
};

exports.findCharacter = findCharacter;
exports.findSupplements = findSupplements;
exports.checkIfSearch = checkIfSearch;
