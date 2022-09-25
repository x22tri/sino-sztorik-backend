const { Op } = require('sequelize');
const Similar = require('../../models/similars');
const HttpError = require('../../models/http-error');

const {
  SIMILARS_DATABASE_QUERY_FAILED_ERROR,
} = require('../../util/string-literals');
const { SimilarType } = require('../../util/enums/enums');

require('../../util/helper-functions');

/**
 * @typedef {Object} Character
 * @typedef {Object} Similar
 */

/**
 * Finds all characters similar to the requested character and returns their latest character object version
 * that the user is eligible to see.
 *
 * @param {number} currentTier - The tier that the user is currently at.
 * @param {number} currentLesson - The lesson that the user is currently at.
 * @param {Character} requestedChar - The character object whose similars we're querying.
 * @param {boolean} admin - `true` when the function is called from the admin dashboard, `false` otherwise.
 * @param {Function} findCharacter - The querying function to find the latest eligible version.
 * @returns {Promise<[Character[], Character[]]>} The character's entry in the "Similars" table.
 */
async function findSimilars(
  currentTier,
  currentLesson,
  requestedChar,
  admin,
  findCharacter
) {
  let similarAppearanceArray = [];
  let similarMeaningArray = [];
  const emptyResponse = [[], []];

  try {
    const foundCharInDB = await findCharInSimilarDB(requestedChar);

    if (!foundCharInDB) {
      return emptyResponse;
    }

    const similarChars = await findCharsInSameSimilarGroup(foundCharInDB);

    if (!similarChars?.length) {
      return emptyResponse;
    }

    for (const similarChar of similarChars) {
      try {
        const latestEligibleVersion = admin
          ? similarChar
          : await findCharacter(
              currentTier,
              currentLesson,
              similarChar.charChinese,
              false
            );

        if (!latestEligibleVersion) {
          continue;
        }

        // The findCharacter call earlier already filters out the characters in higher tiers or lessons,
        // but not those that are in the same lesson but come later.
        if (latestEligibleVersion.comesLaterThan(requestedChar)) {
          continue;
        }

        if (similarChar.similarType === SimilarType.APPEARANCE) {
          similarAppearanceArray.push(latestEligibleVersion);
        }

        if (similarChar.similarType === SimilarType.MEANING) {
          latestEligibleVersion.similarToPrimitiveMeaning =
            similarChar.similarToPrimitiveMeaning || undefined;

          similarMeaningArray.push(latestEligibleVersion);
        }
        // An error returned from findCharacter should only skip the character in question, not crash the application.
        // To-Do: Change this behavior (remove the inner try-catch) testing with a finished database
        // as it points to gaps in the CharacterOrder database.
      } catch (err) {
        continue;
      }
    }
  } catch (err) {
    throw new HttpError(SIMILARS_DATABASE_QUERY_FAILED_ERROR, 500);
  }

  return [similarAppearanceArray, similarMeaningArray];
}

/**
 * Takes a character object and finds its entry in the "Similars" table.
 *
 * @param {Character} requestedChar - A character object.
 * @returns {Promise<Similar>} The character's entry in the "Similars" table.
 */
async function findCharInSimilarDB(requestedChar) {
  const foundCharInDB = await Similar.findOne({
    where: { charChinese: requestedChar.charChinese },
    raw: true,
  });

  return foundCharInDB;
}

/**
 * Takes an entry in the "Similars" table and finds all other entries that are in the same `similarGroup`.
 *
 * @param {Similar} similarEntry - An entry in the "Similars" table.
 * @returns {Promise<Similar[]>} The array of all other entries in the "Similars" table
 * that share the passed-in argument's `similarGroup` property.
 */
async function findCharsInSameSimilarGroup(similarEntry) {
  const similarChars = await Similar.findAll({
    where: {
      [Op.and]: [
        { similarGroup: similarEntry.similarGroup },
        {
          [Op.not]: [{ charChinese: similarEntry.charChinese }],
        },
      ],
    },
    raw: true,
  });

  return similarChars;
}

module.exports = {
  findSimilars,
};
