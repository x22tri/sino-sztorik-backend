import {
  CONSTITUENTS_QUERY_FAILED_ERROR,
  CONSTITUENT_ENTRY_QUERY_FAILED_ERROR,
} from '../../../util/string-literals.js';

import {
  CONSTITUENT_SEPARATOR,
  INTERACTIVE_WORD_WRAPPER,
  INTERACTIVE_WORD_SEPARATOR,
} from '../../../util/config.js';

import { InteractiveWordType } from '../../../util/enums.js';
import { findBareCharacter } from './findBareCharacter.js';
import { throwError } from '../../../util/functions/throwError.js';
import Character from '../../../models/characters.js';
import { Progress } from '../../../util/interfaces.js';
import { CharacterOrder } from '../../../models/character-orders.js';

/**
 * Takes a character object and returns the bare character objects of its constituents.
 * If the input character's "constituents" field is not specified,
 * the function will collect all constituent references from its story.
 *
 * @param char - The character object whose constituent objects we're querying.
 * @returns An array of character objects.
 */
async function findConstituents(
  char: CharacterOrder & Character
): Promise<(CharacterOrder & Character)[]> {
  let constituentStringArray: string[];

  const { constituents, story, tier, lessonNumber } = char;

  try {
    constituentStringArray = constituents
      ? constituents.split(CONSTITUENT_SEPARATOR)
      : findConstituentsInStory(story);
  } catch (error) {
    throwError({
      error,
      message: CONSTITUENTS_QUERY_FAILED_ERROR,
      code: 500,
    });
  }

  try {
    let constituentCharacterObjects: (CharacterOrder & Character)[] = [];
    const progress = { tier: tier, lessonNumber: lessonNumber };

    for (const constituent of constituentStringArray) {
      const currentConstituent = await findBareCharacter(constituent, progress);

      if (!currentConstituent) {
        continue;
      }

      constituentCharacterObjects.push(currentConstituent);
    }

    return constituentCharacterObjects;
  } catch (error) {
    throwError({
      error,
      message: CONSTITUENT_ENTRY_QUERY_FAILED_ERROR,
      code: 500,
    });
  }
}

/**
 * Takes the content of an interactive word and returns the element before the separator,
 * i.e. the type of the interactive word.
 *
 * @param {string} interactiveWordContent - The content of an interactive word (wrapper excluded).
 * @returns {string} The type of the interactive word. Can also be a constituent (a Chinese character).
 */
function getInteractiveWordType(interactiveWordContent) {
  return interactiveWordContent.split(INTERACTIVE_WORD_SEPARATOR)[0];
}

/**
 * Takes a character's story and finds all unique constituents mentioned in the story's interactive words,
 * in the order they are mentioned.
 *
 * @param {string} story - The character's story.
 * @returns {string[]} An array of unique character strings.
 */
function findConstituentsInStory(story) {
  const wrapper = new RegExp(`[${INTERACTIVE_WORD_WRAPPER}]`, 'g');

  const interactiveWordContentArray = story
    .split(wrapper)
    .filter(substring => substring.includes(INTERACTIVE_WORD_SEPARATOR));

  const uniqueConstituents = interactiveWordContentArray
    .map(content => getInteractiveWordType(content))
    // @ts-ignore
    .filter(type => Object.values(InteractiveWordType).includes(type) === false)
    .filter(onlyUnique);

  return uniqueConstituents;
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

export { findConstituents };
