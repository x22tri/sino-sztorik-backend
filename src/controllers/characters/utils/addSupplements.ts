import { findSimilars } from './findSimilars.js';
import { findPhrases } from './findPhrases.js';
import { findOtherUses } from './findOtherUses.js';
import { findConstituents } from './findConstituents.js';
import Character from '../../../models/characters.js';
import { FullCharacter } from '../../../util/interfaces.js';
import CharacterOrder from '../../../models/character-orders.js';

/**
 * Takes a character object and finds all supplemental information about it:
 * other characters that are similar (either in appearance or meaning),
 * phrases with the character, the character's other uses,
 * and the character objects of all its constituents.
 *
 * @param char - The character object whose supplements we're querying.
 * @returns The character object, complete with supplemental information.
 */
async function addSupplements(
  char: CharacterOrder & Character
): Promise<FullCharacter> {
  const similars = await findSimilars(char);
  const phrases = await findPhrases(char);
  const otherUses = await findOtherUses(char);
  const constituents = await findConstituents(char);

  return {
    ...char,
    similars,
    phrases,
    otherUses,
    constituents,
  } as FullCharacter;
}

export { addSupplements };
