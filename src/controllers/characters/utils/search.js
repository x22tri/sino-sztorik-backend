import { findCharacter } from './findCharacter.js';
import { findTermAsKeywordOrPrimitive } from './findTermAsKeywordOrPrimitive.js';
import { findCharByKeywordOrPrimitive } from './findCharByKeywordOrPrimitive.js';

/**
 * @typedef {Object} Character
 *
 * @typedef {Object} Progress
 * @property {number} tier The tier the user is currently at.
 * @property {number} lessonNumber The lesson the user is currently at.
 * @property {number} [indexInLesson] The index of the character the user is currently at.
 * /

/**
 * Based on a string the user searched for, finds the relevant character object(s).
 * If the string is not already a Chinese character, it is presumed to be a keyword or primitive meaning.
 *
 * @param {string} searchTerm - The string we're querying.
 * @param {Progress} userProgress - The user's current progress in the course.
 *
 * @returns {Promise<Character | Character[]>} The character object(s).
 */
async function search(searchTerm, userProgress) {
  userProgress.lessonNumber = userProgress.lessonNumber - 1; // User isn't eligible to the upcoming lesson in a search request.

  if (isSearchTermChinese(searchTerm)) {
    const foundSearchChar = await findCharacter(searchTerm, userProgress);

    return foundSearchChar;
  }

  const keywordsOrPrimitives = await findTermAsKeywordOrPrimitive(searchTerm);

  const foundChars = await findCharByKeywordOrPrimitive(
    keywordsOrPrimitives,
    userProgress
  );

  return foundChars;
}

function isSearchTermChinese(searchTerm) {
  return /^[一-鿕]+$/u.test(searchTerm);
}

export { search };