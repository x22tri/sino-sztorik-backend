// Setting up database associations.
import Character from '../models/characters.js';
import { CharacterOrder } from '../models/character-orders.js';

CharacterOrder.belongsTo(Character, { foreignKey: 'charId' });
Character.hasOne(CharacterOrder, { foreignKey: 'charId' });

// Setting up type definitions.

/**
 * @typedef {Object} Character
 *
 * @typedef {Object} Progress
 * @property {number} tier The tier the user is currently at.
 * @property {number} lessonNumber The lesson the user is currently at.
 * @property {number} [indexInLesson] The index of the character the user is currently at.
 *
 * @typedef {Object} Phrase
 * @typedef {Object} OtherUse
 * @typedef {Object} Similar
 * @typedef {Object} Lesson
 */
