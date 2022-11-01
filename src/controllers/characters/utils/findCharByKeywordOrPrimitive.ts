import { findCharByCharChinese } from './findCharByCharChinese.js';
import { SEARCH_NO_ELIGIBLE_MATCH } from '../../../util/string-literals.js';
import { throwError } from '../../../util/functions/throwError.js';
import { FullCharacter, Progress } from '../../../util/interfaces.js';
import Character from '../../../models/characters.js';

async function findCharByKeywordOrPrimitive(
  keywordsOrPrimitives: Character[],
  userProgress: Progress
) {
  let foundSearchCharsArray: FullCharacter[] = [];

  for (const keywordOrPrimitive of keywordsOrPrimitives) {
    const foundSearchChar = await findCharByCharChinese(
      keywordOrPrimitive.charChinese,
      userProgress
    );

    if (foundSearchChar) {
      foundSearchCharsArray.push(foundSearchChar);
    }
  }

  if (!foundSearchCharsArray.length) {
    throwError({ message: SEARCH_NO_ELIGIBLE_MATCH, code: 401 });
  } else {
    return foundSearchCharsArray;
  }
}

export { findCharByKeywordOrPrimitive };
