import Character from '../../../models/characters.js';
import OtherUse from '../../../models/other-uses.js';
import { Progress } from '../../../util/interfaces.js';
import { OTHER_USES_DATABASE_QUERY_FAILED_ERROR } from '../../../util/string-literals.js';
import { throwError } from '../../../util/functions/throwError.js';

/**
 * Takes a character object and finds all meanings of the character other than its keyword, together with
 * how the character is pronounced when used in that meaning.
 *
 * @param char - The character object whose phrases we're querying.
 * @returns An array of entries in the OtherUses table, with the pinyin removed from certain entries.
 */
async function findOtherUses(char: Character): Promise<OtherUse[]> {
  try {
    let foundCharInDB = await OtherUse.findAll({
      where: { charChinese: char.charChinese },
      order: ['pinyin'], // Sort by pinyin (accent-sensitive).
      attributes: ['pinyin', 'otherUseHungarian'],
    });

    _removeDuplicatePinyins(foundCharInDB);

    return foundCharInDB;
  } catch (err) {
    throwError({ message: OTHER_USES_DATABASE_QUERY_FAILED_ERROR, code: 500 });
  }
}

/**
 * Takes an array of sorted entries in the OtherUses table and removes the pinyins of entries
 * where the same pinyin would be displayed several times consecutively.
 *
 * @param otherUseEntries - An array of entries in the OtherUses table.
 * They must have previously been sorted by pinyin in an accent-sensitive way.
 * @returns An array of entries in the OtherUses table, with the pinyin removed from certain entries.
 */
function _removeDuplicatePinyins(otherUseEntries: OtherUse[]): OtherUse[] {
  if (otherUseEntries?.length < 2) {
    return otherUseEntries;
  }

  let lastDifferentPinyin = otherUseEntries[0].pinyin;

  for (let i = 1; i < otherUseEntries.length; i++) {
    let currentPinyin = otherUseEntries[i].pinyin;

    if (currentPinyin !== lastDifferentPinyin) {
      lastDifferentPinyin = currentPinyin;
    } else {
      currentPinyin = undefined;
    }
  }

  return otherUseEntries;
}

export { findOtherUses };
