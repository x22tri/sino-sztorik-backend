const { Op } = require('sequelize');
const Phrase = require('../../models/phrases');
const HttpError = require('../../models/http-error');

const {
  PHRASES_DATABASE_QUERY_FAILED_ERROR,
} = require('../../util/string-literals');

require('../../util/helper-functions');

/**
 * @typedef {Object} Character
 * @typedef {Object} Phrase
 */

/**
 * Takes a character object and all the phrases containing the character that the user is eligible to see,
 * with the last eligible version of each character's full character object.
 *
 * @param {number} currentTier - The tier that the user is currently at.
 * @param {number} currentLesson - The lesson that the user is currently at.
 * @param {Character} requestedChar - The character object whose phrases we're querying.
 * @param {boolean} admin - `true` when the function is called from the admin dashboard, `false` otherwise.
 * @param {Function} findCharacter - The querying function to find the latest eligible version.
 * @returns {Promise<Phrase[]>} The character objects of all characters that make up the phrase.
 */
async function findPhrases(
  currentTier,
  currentLesson,
  requestedChar,
  admin,
  findCharacter
) {
  let phrasesWithAllCharObjects = [];

  try {
    const phrasesWithRequestedChar = await findAllPhrasesWithChar(
      requestedChar
    );

    // No eligibility checks or character breakdown needed if the function is called with "admin".
    if (admin) {
      return phrasesWithRequestedChar;
    }

    // Go through each character in each phrase.
    // If user is not eligible for at least one of the characters, don't show the phrase altogether.
    for (const phraseObject of phrasesWithRequestedChar) {
      const allCharObjectsInPhrase =
        await findLastEligibleVersionOfCharsInPhrase(
          currentTier,
          currentLesson,
          requestedChar,
          phraseObject.phraseChinese,
          findCharacter
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
 * @param {Character} requestedChar - A character object.
 * @returns {Promise<Phrase[]>} All entries in the "Phrases" table that contains the character.
 */
async function findAllPhrasesWithChar(requestedChar) {
  const foundCharInDB = await Phrase.findAll({
    where: {
      phraseChinese: {
        [Op.like]: `%${requestedChar.charChinese}%`,
      },
    },
    raw: true,
  });

  return foundCharInDB;
}

/**
 * Takes a phrase string and returns the last version of all its characters that the user is eligible to see.
 *
 * @param {number} currentTier - The tier that the user is currently at.
 * @param {number} currentLesson - The lesson that the user is currently at.
 * @param {string} requestedChar - The character whose phrases we're querying.
 * @param {string} phrase - The phrase (the actual string, not the database entry) to analyze.
 * @param {Function} findCharacter - The querying function to find the latest eligible version.
 * @returns {Promise<Character[]> | null} The character objects of all characters that make up the phrase.
 */
async function findLastEligibleVersionOfCharsInPhrase(
  currentTier,
  currentLesson,
  requestedChar,
  phrase,
  findCharacter
) {
  let charObjectsInPhrase = [];

  for (const phraseChar of phrase) {
    try {
      const latestEligibleVersion = await findCharacter(
        currentTier,
        currentLesson,
        phraseChar,
        false
      );

      if (!latestEligibleVersion) {
        break;
      }

      // The findCharacter call earlier already filters out the characters in higher tiers or lessons,
      // but not those that are in the same lesson but come later.
      if (latestEligibleVersion.comesLaterThan(requestedChar)) {
        break;
      }

      charObjectsInPhrase.push(latestEligibleVersion);

      if (charObjectsInPhrase.length === phrase.length) {
        return charObjectsInPhrase;
      }

      // An error returned from findCharacter should only skip the phrase, not crash the application.
      // To-Do: Change this behavior while testing with a finished database
      // as it points to gaps in the database or errors in the findCharacter function.
      // Potentially separate a "forbidden" response (which is normal and indicates the phrase is to be skipped)
      // from any other response (which indicates a bug).
    } catch (err) {
      break;
    }
  }

  return null;
}

module.exports = {
  findPhrases,
};
