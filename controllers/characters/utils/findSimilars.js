import { Op } from 'sequelize';
const { and, not } = Op;

import Similar from '../../../models/similars.js';
import HttpError from '../../../models/http-error.js';
import { SIMILARS_DATABASE_QUERY_FAILED_ERROR } from '../../../util/string-literals.js';
import { SimilarType } from '../../../util/enums.js';
import { findBareCharacter } from './findBareCharacter.js';
import { getCharProgress } from './getCharProgress.js';

/**
 * Finds all characters similar to the requested character and returns their latest character object version
 * that the user is eligible to see.
 *
 * @param {Character} char - The character object whose similars we're querying.
 * @returns {Promise<{similarAppearance: Character[], similarMeaning: Character[]}>} The character's entry in the "Similars" table.
 */
async function findSimilars(char) {
  let similarAppearance = [];
  let similarMeaning = [];
  const emptyResponse = [[], []];

  try {
    const foundCharInDB = await findCharInSimilarDB(char);

    if (!foundCharInDB) {
      return emptyResponse;
    }

    const similarChars = await findCharsInSameSimilarGroup(foundCharInDB);

    if (!similarChars?.length) {
      return emptyResponse;
    }

    for (const similarChar of similarChars) {
      try {
        const latestEligibleVersion = await findBareCharacter(
          similarChar.charChinese,
          getCharProgress(char)
        );

        if (!latestEligibleVersion) {
          continue;
        }

        if (similarChar.similarType === SimilarType.APPEARANCE) {
          similarAppearance.push(latestEligibleVersion);
        }

        if (similarChar.similarType === SimilarType.MEANING) {
          const { similarToPrimitiveMeaning } = similarChar;

          similarMeaning.push({
            ...latestEligibleVersion,
            similarToPrimitiveMeaning: !!similarToPrimitiveMeaning,
          });
        }
        // An error returned from findBareCharacter should only skip the character in question, not crash the application.
        // To-Do: Change this behavior (remove the inner try-catch) testing with a finished database
        // as it points to gaps in the CharacterOrder database.
      } catch (err) {
        continue;
      }
    }
  } catch (err) {
    throw new HttpError(SIMILARS_DATABASE_QUERY_FAILED_ERROR, 500);
  }

  return { similarAppearance, similarMeaning };
}

/**
 * Takes a character object and finds its entry in the "Similars" table.
 *
 * @param {Character} char - A character object.
 * @returns {Promise<Similar>} The character's entry in the "Similars" table.
 */
async function findCharInSimilarDB(char) {
  const foundCharInDB = await Similar.findOne({
    where: { charChinese: char.charChinese },
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
      [and]: [
        { similarGroup: similarEntry.similarGroup },
        {
          [not]: [{ charChinese: similarEntry.charChinese }],
        },
      ],
    },
    raw: true,
  });

  return similarChars;
}

export { findSimilars };
