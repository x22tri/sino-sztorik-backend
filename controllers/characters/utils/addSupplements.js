const { findSimilars } = require('./findSimilars');
const { findPhrases } = require('./findPhrases');
const { findOtherUses } = require('./findOtherUses');
const { findConstituents } = require('./findConstituents');

/**
 * @typedef {Object} Character
 */

/**
 * Takes a character object and finds all supplemental information about it:
 * other characters that are similar (either in appearance or meaning),
 * phrases with the character, the character's other uses,
 * and the character objects of all its constituents.
 *
 * @param {Character} char - The character object whose supplements we're querying.
 * @returns {Promise<Character>} The character object, complete with supplemental information.
 */
async function addSupplements(char) {
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
  };
}

module.exports = {
  addSupplements,
};
