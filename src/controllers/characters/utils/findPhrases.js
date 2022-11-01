import { Op } from 'sequelize';
const { like } = Op;

import Phrase from '../../../models/phrases.js';
import { PHRASES_DATABASE_QUERY_FAILED_ERROR } from '../../../util/string-literals.js';

import { findBareCharacter } from './findBareCharacter.js';
import { getCharProgress } from './getCharProgress.js';
import { throwError } from '../../../util/functions/throwError.js';

/**
 * @typedef {Object} Lesson
 * @typedef {Object} Character
 *
 * @typedef {Object} Progress
 * @property {number} tier The tier the user is currently at.
 * @property {number} lessonNumber The lesson the user is currently at.
 * @property {number} [indexInLesson] The index of the character the user is currently at.
 * /

/**
 * Takes a character object and finds all the phrases containing the character that the user is eligible to see,
 * with the last eligible version of each character's character object.
 * @param {Character} char - The character object whose phrases we're querying.
 
 * @returns {Promise<Phrase[]>} The character objects of all characters that make up the phrase.
 */
async function findPhrases(char) {
  let phrasesWithAllCharObjects = [];

  try {
    const phrasesWithchar = await _findAllPhrasesWithChar(char);

    // Go through each character in each phrase.
    // If user is not eligible for at least one of the characters, don't show the phrase altogether.
    for (const phraseObject of phrasesWithchar) {
      const allCharObjectsInPhrase =
        await _findLastEligibleVersionOfCharsInPhrase(
          getCharProgress(char),
          //@ts-ignore
          phraseObject.phraseChinese
        );

      if (!allCharObjectsInPhrase) {
        continue;
      }

      phrasesWithAllCharObjects.push({
        ...phraseObject,
        characters: allCharObjectsInPhrase,
      });
    }
  } catch (err) {
    throwError({ message: PHRASES_DATABASE_QUERY_FAILED_ERROR, code: 500 });
  }

  //@ts-ignore
  return phrasesWithAllCharObjects;
}

/**
 * Takes a character object and finds all entries in the "Phrases" table that contains the Chinese character.
 *
 * @param {Character} char - A character object.
 * @returns {Promise<Phrase[]>} All entries in the "Phrases" table that contains the character.
 */
async function _findAllPhrasesWithChar(char) {
  const foundCharInDB = await Phrase.findAll({
    where: {
      phraseChinese: {
        [like]: `%${char.charChinese}%`,
      },
    },
    raw: true,
  });

  //@ts-ignore
  return foundCharInDB;
}

/**
 * Takes a phrase string and returns the last version of all its characters that the user is eligible to see.
 *
 * @param {Progress} progress - The tier, lesson and index that the user is currently at.
 * @param {string} phrase - The phrase (the actual string, not the database entry) to analyze.
 * @returns {Promise<Character[] | null>} The character objects of all characters that make up the phrase.
 */
async function _findLastEligibleVersionOfCharsInPhrase(progress, phrase) {
  let charObjectsInPhrase = [];

  for (const phraseChar of phrase) {
    try {
      const latestEligibleVersion = await findBareCharacter(
        phraseChar,
        progress
      );

      if (!latestEligibleVersion) {
        break; // If the user is ineligible for even one character in the phrase, they are ineligible for the phrase altogether.
      }

      charObjectsInPhrase.push(latestEligibleVersion);

      if (charObjectsInPhrase.length === phrase.length) {
        return charObjectsInPhrase;
      }
    } catch (error) {
      break;
    }
  }

  return null;
}

export { findPhrases };
