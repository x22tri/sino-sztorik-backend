import { Op } from 'sequelize';
const { like } = Op;

import Phrase from '../../../models/phrases.js';
import HttpError from '../../../models/http-error.js';
import { PHRASES_DATABASE_QUERY_FAILED_ERROR } from '../../../util/string-literals.js';
import { findBareCharacter } from './findBareCharacter.js';
import { getCharProgress } from './getCharProgress.js';

/**
 * Takes a character object and finds all the phrases containing the character that the user is eligible to see,
 * with the last eligible version of each character's character object.
 *
 * @param {number} currentTier - The tier that the user is currently at.
 * @param {number} currentLesson - The lesson that the user is currently at.
 * @param {Character} char - The character object whose phrases we're querying.
 
 * @returns {Promise<Phrase[]>} The character objects of all characters that make up the phrase.
 */
async function findPhrases(char) {
  let phrasesWithAllCharObjects = [];

  try {
    const phrasesWithchar = await findAllPhrasesWithChar(char);

    // Go through each character in each phrase.
    // If user is not eligible for at least one of the characters, don't show the phrase altogether.
    for (const phraseObject of phrasesWithchar) {
      const allCharObjectsInPhrase =
        await findLastEligibleVersionOfCharsInPhrase(
          getCharProgress(char),
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
    throw new HttpError(PHRASES_DATABASE_QUERY_FAILED_ERROR, 500);
  }

  return phrasesWithAllCharObjects;
}

/**
 * Takes a character object and finds all entries in the "Phrases" table that contains the Chinese character.
 *
 * @param {Character} char - A character object.
 * @returns {Promise<Phrase[]>} All entries in the "Phrases" table that contains the character.
 */
async function findAllPhrasesWithChar(char) {
  const foundCharInDB = await Phrase.findAll({
    where: {
      phraseChinese: {
        [like]: `%${char.charChinese}%`,
      },
    },
    raw: true,
  });

  return foundCharInDB;
}

/**
 * Takes a phrase string and returns the last version of all its characters that the user is eligible to see.
 *
 * @param {Progress} progress - The tier, lesson and index that the user is currently at.
 * @param {string} phrase - The phrase (the actual string, not the database entry) to analyze.
 * @returns {Promise<Character[]> | null} The character objects of all characters that make up the phrase.
 */
async function findLastEligibleVersionOfCharsInPhrase(progress, phrase) {
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

      // An error returned from findBareCharacter should only skip the phrase, not crash the application.
      // To-Do: Change this behavior while testing with a finished database
      // as it points to gaps in the database or errors in the findBareCharacter function.
      // Potentially separate a "forbidden" response (which is normal and indicates the phrase is to be skipped)
      // from any other response (which indicates a bug).
    } catch (err) {
      break;
    }
  }

  return null;
}

export { findPhrases };
