// Setting up database associations.
const Character = require('../models/characters');
const CharacterOrder = require('../models/character-orders');

CharacterOrder.belongsTo(Character, { foreignKey: 'charId' });
Character.hasOne(CharacterOrder, { foreignKey: 'charId' });

// Setting up custom object properties.
const { INVALID_NUMBERS_PROVIDED } = require('./string-literals');

/**
 * A method that compares two progress states (objects that have "tier", "lessonNumber" and optionally "indexInLesson" properties).
 * These can be entries from the CharacterOrders table, or objects with the user's current tier and lessonNumber.
 */
Object.defineProperty(Object.prototype, 'comesLaterThan', {
  value: function (secondState) {
    const firstState = Object(this).valueOf();

    if (
      !(
        Number.isInteger(firstState.tier) &&
        Number.isInteger(secondState.tier) &&
        Number.isInteger(firstState.lessonNumber) &&
        Number.isInteger(secondState.lessonNumber)
      )
    ) {
      throw new Error(INVALID_NUMBERS_PROVIDED);
    }

    if (
      (firstState.indexInLesson &&
        !Number.isInteger(firstState.indexInLesson)) ||
      (secondState.indexInLesson &&
        !Number.isInteger(secondState.indexInLesson))
    ) {
      throw new Error(INVALID_NUMBERS_PROVIDED);
    }

    if (firstState.tier > secondState.tier) {
      return true;
    }

    if (
      firstState.tier === secondState.tier &&
      firstState.lessonNumber > secondState.lessonNumber
    ) {
      return true;
    }

    if (
      firstState.tier === secondState.tier &&
      firstState.lessonNumber === secondState.lessonNumber &&
      firstState.indexInLesson > secondState.indexInLesson
    ) {
      return true;
    }

    return false;
  },
});

/**
 * In an array of objects containing a nested object, modifies the objects by extracting the nested object into the main object.
 * Use after a Sequelize query with an "include" parameter.
 *
 * @param {string} field - The name of the property which contains the nested object.
 * @returns {void} Modifies `this` to now have the nested property extracted to the main object.
 *
 * ---
 *
 * When Sequelize queries are made with the "include" parameter,
 * the included (outer joined) table is placed into a nested object with the table's name.
 *
 * If, for example, the query is `CharacterOrder.findAll({include: [Character]})`,
 * the returned `characterOrder` object will have a `characters` field,
 * containing an object with the queried character's data.
 *
 * This function extracts the nested object (bearing the property name `field`)
 * and adds its content to the main object.
 */

Array.prototype.hoistField = function (field) {
  for (let i = 0; i < this.length; i++) {
    this[i] = { ...this[i], ...this[i][field] };

    delete this[i][field];
  }
};

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
