import { Op } from 'sequelize';
const { and, not } = Op;

import Character from '../../../models/characters.js';
import OtherUse from '../../../models/other-uses.js';
import Similar from '../../../models/similars.js';
import { Progress } from '../../../util/interfaces.js';
import { SIMILARS_DATABASE_QUERY_FAILED_ERROR } from '../../../util/string-literals.js';

import { SimilarType } from '../../../util/enums.js';
const { APPEARANCE, MEANING } = SimilarType;
import { findBareCharacter } from './findBareCharacter.js';
import { getCharProgress } from './getCharProgress.js';
import { throwError } from '../../../util/functions/throwError.js';
import { CharacterOrder } from '../../../models/character-orders.js';

type CharWithOrder = CharacterOrder & Character;

interface SimilarMeaningCharWithOrder extends CharWithOrder {
  similarToPrimitiveMeaning: boolean;
}

/**
 * Finds all characters similar to the requested character and returns their latest character object version
 * that the user is eligible to see.
 *
 * @param char - The character object whose similars we're querying.
 * @returns The character's entry in the "Similars" table.
 */
async function findSimilars(char: Character) {
  const emptyResponse = { similarAppearance: [], similarMeaning: [] };

  try {
    const foundCharInDB = await _findCharInSimilarDB(char);

    if (!foundCharInDB) {
      return emptyResponse;
    }

    const similarChars = await _findCharsInSameSimilarGroup(foundCharInDB);

    if (!similarChars?.length) {
      return emptyResponse;
    }

    let similarAppearance: (CharacterOrder & Character)[] = [];
    let similarMeaning: (CharacterOrder & Character)[] = [];

    for (const similarChar of similarChars) {
      try {
        const latestEligibleVersion = await findBareCharacter(
          similarChar.charChinese,
          getCharProgress(char)
        );

        if (!latestEligibleVersion) {
          continue;
        }

        if (similarChar.similarType === APPEARANCE) {
          similarAppearance.push(latestEligibleVersion);
        }

        if (similarChar.similarType === MEANING) {
          const { similarToPrimitiveMeaning } = similarChar;

          similarMeaning.push({
            ...latestEligibleVersion,
            similarToPrimitiveMeaning: !!similarToPrimitiveMeaning,
          } as SimilarMeaningCharWithOrder);
        }
      } catch (error) {
        continue;
      }
    }

    return { similarAppearance, similarMeaning };
  } catch (err) {
    throwError({ message: SIMILARS_DATABASE_QUERY_FAILED_ERROR, code: 500 });
  }
}

/**
 * Takes a character object and finds its entry in the "Similars" table.
 *
 * @param char - A character object.
 * @returns The character's entry in the "Similars" table.
 */
async function _findCharInSimilarDB(char: Character) {
  const foundCharInDB = await Similar.findOne({
    where: { charChinese: char.charChinese },
    raw: true,
  });

  return foundCharInDB;
}

/**
 * Takes an entry in the "Similars" table and finds all other entries that are in the same `similarGroup`.
 *
 * @param similarEntry - An entry in the "Similars" table.
 * @returns The array of all other entries in the "Similars" table that share the passed-in argument's `similarGroup` property.
 */
async function _findCharsInSameSimilarGroup(similarEntry: Similar) {
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
