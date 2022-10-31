import Character from '../../../models/characters.js';
import { CharacterOrder } from '../../../models/character-orders.js';
import HttpError from '../../../models/http-error.js';

import {
  CHARACTER_NOT_FOUND_ERROR,
  CHARACTER_QUERY_FAILED_ERROR,
  DATABASE_QUERY_FAILED_ERROR,
  SEARCH_NO_MATCH,
} from '../../../util/string-literals.js';

import { Progress } from '../../../util/interfaces.js';

/**
 * Finds the character object for the requested character, without finding supplements.
 *
 * @param {string} char - The character string we're querying.
 * @param {Progress} progress - The tier and lesson that the user is currently at.
 * Alternatively, when called by a supplement-gathering function like findSimilars,
 * the tier, lesson and index of a character that serves as a comparison point.
 * @returns {Promise<Character | null>} The character object.
 */
async function findBareCharacter(char: string, progress: Progress) {
  const ids = await findAllCharIdsByChar(char);
  const characterVersionsInOrder = await findAllCharVersionsByCharIds(ids);
  const firstCharVersion = characterVersionsInOrder[0];

  if (firstCharVersion.comesLaterThan(progress)) {
    return null;
  }

  let charToMutate = await JSON.parse(JSON.stringify(firstCharVersion));

  try {
    for (let i = 1; i < characterVersionsInOrder.length; i++) {
      const currentCharVersion = characterVersionsInOrder[i];

      if (currentCharVersion.comesLaterThan(progress)) {
        break; // If a user is ineligible for one version, they'll be ineligible for all versions after that.
        // (This presupposes that the versions have been sorted beforehand during the function.)
      }

      if (currentCharVersion.charId === firstCharVersion.charId) {
        charToMutate.reminder = true;
      }

      if (currentCharVersion.primitiveMeaning !== null) {
        charToMutate.newPrimitive = true;
      }

      replaceNewProperties(currentCharVersion, charToMutate);
    }
  } catch (err) {
    throw new HttpError(DATABASE_QUERY_FAILED_ERROR, 500);
  }

  return charToMutate;
}

/**
 * Takes a Chinese character and returns all the character object ID's associated with the character.
 *
 * @param char - A Chinese character.
 * @returns An array of character ID's.
 */
async function findAllCharIdsByChar(char: string): Promise<string[]> {
  let currentCharEntries: Character[];

  try {
    currentCharEntries = await Character.findAll({
      where: { charChinese: char },
      attributes: ['charId'],
    });
  } catch (err) {
    throw new HttpError(CHARACTER_QUERY_FAILED_ERROR, 500);
  }

  if (!currentCharEntries?.length) {
    throw new HttpError(CHARACTER_NOT_FOUND_ERROR, 404);
  }

  return currentCharEntries.map(entry => entry.charId);
}

/**
 * Takes an array of character ID's and returns the corresponding character objects,
 * sorted by the order that the user will see them in the course.
 *
 * @param charIds - An array of character ID's.
 * @returns An array of character objects.
 */
async function findAllCharVersionsByCharIds(
  charIds: string[]
): Promise<(CharacterOrder & Character)[]> {
  try {
    let charVersionsInOrder = await CharacterOrder.findAllAndHoist({
      where: { charId: charIds },
      include: Character,
      order: ['tier', 'lessonNumber', 'indexInLesson'],
    });

    if (!charVersionsInOrder?.length) {
      throw new HttpError(SEARCH_NO_MATCH, 404);
    }

    return charVersionsInOrder as (CharacterOrder & Character)[];
  } catch (err) {
    throw new HttpError(DATABASE_QUERY_FAILED_ERROR, 500);
  }
}

/**
 * Adds all of `currentCharVersion`'s truthy properties to `charToMutate`.
 *
 * Falsy values, such as null, undefined, or empty string, do not overwrite `charToMutate`.
 *
 * @param currentCharVersion - The object whose properties will be copied.
 * @param charToMutate - The object that will receive the updated properties.
 *
 * The function is intended to be used to "patch" a base character (`charToMutate`) with the "diffs" of later versions.
 *
 * As such, it is supposed to be used with two character objects (who have the same model, and therefore, the same property keys).
 */
function replaceNewProperties(
  currentCharVersion: Character,
  charToMutate: Character
): void {
  const currentVersion = currentCharVersion.get({ plain: true });

  for (let i = 0; i < Object.keys(currentVersion).length; i++) {
    const [key, value] = Object.entries(currentVersion)[i];

    if (value) {
      charToMutate[key] = value;
    }
  }
}

export { findBareCharacter };
