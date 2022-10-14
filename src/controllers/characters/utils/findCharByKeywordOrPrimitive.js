import HttpError from '../../../models/http-error.js';
import { findCharacter } from './findCharacter.js';
import { SEARCH_NO_ELIGIBLE_MATCH } from '../../../util/string-literals.js';

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

export { findCharByKeywordOrPrimitive };
