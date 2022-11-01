import { findCharByCharChinese } from './findCharByCharChinese.js';
import { findTermAsKeywordOrPrimitive } from './findTermAsKeywordOrPrimitive.js';
import { findCharByKeywordOrPrimitive } from './findCharByKeywordOrPrimitive.js';
import { Progress } from '../../../util/interfaces.js';

/**
 * Based on a string the user searched for, finds the relevant character object(s).
 *
 * If the string is not already a Chinese character, it is presumed to be a keyword or primitive meaning.
 *
 * @param  searchTerm - The string we're querying.
 * @param userProgress - The user's current progress in the course.
 * @returns The character object(s).
 */
async function search(searchTerm: string, userProgress: Progress) {
  userProgress.lessonNumber = userProgress.lessonNumber - 1; // User isn't eligible to the upcoming lesson in a search request.

  if (_isSearchTermChinese(searchTerm)) {
    const foundSearchChar = await findCharByCharChinese(
      searchTerm,
      userProgress
    );

    return foundSearchChar;
  }

  const keywordsOrPrimitives = await findTermAsKeywordOrPrimitive(searchTerm);

  const foundChars = await findCharByKeywordOrPrimitive(
    keywordsOrPrimitives,
    userProgress
  );

  return foundChars;
}

function _isSearchTermChinese(searchTerm: string) {
  return /^[一-鿕]+$/u.test(searchTerm);
}

export { search };
