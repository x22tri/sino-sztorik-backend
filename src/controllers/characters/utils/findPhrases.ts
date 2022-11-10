import { Op } from 'sequelize';
const { like } = Op;

import Lesson from '../../../models/lessons.js';
import Character from '../../../models/characters.js';
import Phrase from '../../../models/phrases.js';
import { Progress } from '../../../util/interfaces.js';
import { PHRASES_DATABASE_QUERY_FAILED_ERROR } from '../../../util/string-literals.js';

import { findBareCharacter } from './findBareCharacter.js';
import { getCharProgress } from './getCharProgress.js';
import { throwError } from '../../../util/functions/throwError.js';
import CharacterOrder from '../../../models/character-orders.js';

interface PhraseWithChars extends Phrase {
  characters: Character[];
}

/**
 * Takes a character object and finds all the phrases containing the character that the user is eligible to see,
 * with the last eligible version of each character's character object.
 * @param char - The character object whose phrases we're querying.
 
 * @returns The character objects of all characters that make up the phrase.
 */
async function findPhrases(char: Character): Promise<Phrase[]> {
  let phrasesWithAllCharObjects: PhraseWithChars[] = [];

  try {
    const phrasesWithchar = await _findAllPhrasesWithChar(char);

    // Go through each character in each phrase.
    // If user is not eligible for at least one of the characters, don't show the phrase altogether.
    for (const phraseObject of phrasesWithchar) {
      const allCharObjectsInPhrase =
        await _findLastEligibleVersionOfCharsInPhrase(
          getCharProgress(char),
          phraseObject.phraseChinese
        );

      if (!allCharObjectsInPhrase) {
        continue;
      }

      phrasesWithAllCharObjects.push({
        ...phraseObject,
        characters: allCharObjectsInPhrase,
      } as PhraseWithChars);
    }
  } catch (err) {
    throwError({ message: PHRASES_DATABASE_QUERY_FAILED_ERROR, code: 500 });
  }

  return phrasesWithAllCharObjects;
}

/**
 * Takes a character object and finds all entries in the "Phrases" table that contains the Chinese character.
 *
 * @param char - A character object.
 * @returns All entries in the "Phrases" table that contains the character.
 */
async function _findAllPhrasesWithChar(char: Character): Promise<Phrase[]> {
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
 * @param progress - The tier, lesson and index that the user is currently at.
 * @param phrase - The phrase (the actual string, not the database entry) to analyze.
 * @returns The character objects of all characters that make up the phrase.
 */
async function _findLastEligibleVersionOfCharsInPhrase(
  progress: Progress,
  phrase: string
): Promise<Character[] | null> {
  let charObjectsInPhrase: (CharacterOrder & Character)[] = [];

  for (const phraseChar of phrase) {
    try {
      const lastEligibleVersion = await findBareCharacter(phraseChar, progress);

      if (!lastEligibleVersion) {
        break; // If the user is ineligible for even one character in the phrase, they are ineligible for the phrase altogether.
      }

      charObjectsInPhrase.push(lastEligibleVersion);

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
