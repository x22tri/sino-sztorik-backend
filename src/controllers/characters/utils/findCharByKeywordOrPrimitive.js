import { findCharByCharChinese } from './findCharByCharChinese.js';
import { SEARCH_NO_ELIGIBLE_MATCH } from '../../../util/string-literals.js';
import { throwError } from '../../../util/functions/throwError.js';

async function findCharByKeywordOrPrimitive(array, userProgress) {
  let foundSearchCharsArray = [];

  for (const keywordOrPrimitive of array) {
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
