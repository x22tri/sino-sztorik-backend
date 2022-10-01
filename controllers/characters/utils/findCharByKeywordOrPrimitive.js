const HttpError = require('../../../models/http-error');

const { findCharacter } = require('./findCharacter');

const { SEARCH_NO_ELIGIBLE_MATCH } = require('../../../util/string-literals');

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

module.exports = {
  findCharByKeywordOrPrimitive,
};
