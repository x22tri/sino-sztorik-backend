import Character from '../../../models/characters.js';
import CharacterOrder from '../../../models/character-orders.js';

import {
  CHARACTER_NOT_FOUND_ERROR,
  CHARACTER_QUERY_FAILED_ERROR,
  DATABASE_QUERY_FAILED_ERROR,
  SEARCH_NO_MATCH,
} from '../../../util/string-literals.js';

import { ERROR_HANDLING_CONFIGURATION } from '../../../util/config.js';
const { logGapsInCharacterDatabase, allowGapsInCharacterDatabase } =
  ERROR_HANDLING_CONFIGURATION;

import { Progress } from '../../../util/interfaces.js';
import { deepCopy } from '../../../util/functions/deepCopy.js';
import { throwError } from '../../../util/functions/throwError.js';

/**
 * Finds the character object for the requested character, without finding supplements.
 *
 * @param char - The character string we're querying.
 * @param progress - The tier and lesson that the user is currently at.
 * Alternatively, when called by a supplement-gathering function like findSimilars:
 * the tier, lesson and index of a character that serves as a comparison point.
 * @returns The character object.
 */
async function findBareCharacter(char: string, progress: Progress) {
  const ids = await _findAllCharIdsByChar(char);
  const characterVersionsInOrder = await _findAllCharVersionsByCharIds(ids);

  if (characterVersionsInOrder?.length === 0) {
    return null;
  }

  const firstCharVersion = characterVersionsInOrder[0];

  if (firstCharVersion.comesLaterThan(progress)) {
    return null;
  }

  let charToMutate = await deepCopy(firstCharVersion);

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

      _replaceNewProperties(currentCharVersion, charToMutate);
    }
  } catch (error) {
    throwError({ error, message: DATABASE_QUERY_FAILED_ERROR, code: 500 });
  }

  return charToMutate;
}

/**
 * Takes a Chinese character and returns all the character object ID's associated with the character.
 *
 * @param char - A Chinese character.
 * @returns An array of character ID's.
 */
async function _findAllCharIdsByChar(char: string): Promise<string[]> {
  let currentCharEntries: Character[];

  try {
    currentCharEntries = await Character.findAll({
      where: { charChinese: char },
      attributes: ['charId'],
    });
  } catch (error) {
    throwError({ error, message: CHARACTER_QUERY_FAILED_ERROR, code: 500 });
  }

  if (!currentCharEntries?.length) {
    throwError({ message: CHARACTER_NOT_FOUND_ERROR, code: 404 });
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
async function _findAllCharVersionsByCharIds(charIds: string[]) {
  const NO_ENTRIES_FOUND = `No character entries can be found for the following character order ID's: 
  ${String(charIds)}`;

  try {
    const charVersionsInOrder = await CharacterOrder.findAllAndHoist({
      where: { charId: charIds },
      include: Character,
      order: ['tier', 'lessonNumber', 'indexInLesson'],
    });

    if (!charVersionsInOrder?.length) {
      if (allowGapsInCharacterDatabase === false) {
        throwError({
          error: new Error(NO_ENTRIES_FOUND),
          message: SEARCH_NO_MATCH,
          code: 404,
        });
      } else if (logGapsInCharacterDatabase) {
        console.log(NO_ENTRIES_FOUND);
      }
    }

    return charVersionsInOrder;
  } catch (error) {
    throwError({ error, message: DATABASE_QUERY_FAILED_ERROR, code: 500 });
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
function _replaceNewProperties(
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
