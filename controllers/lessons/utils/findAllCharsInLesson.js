const { Op } = require('sequelize');
const CharacterOrder = require('../../../models/character-orders');
const Character = require('../../../models/characters');
const HttpError = require('../../../models/http-error');

const {
  LESSON_DATABASE_QUERY_FAILED_ERROR,
} = require('../../../util/string-literals');

/**
 * Takes a progress state and returns the characters in the given lesson.
 *
 * @param {Progress} progress - The progress state (tier and lesson number) to query.
 * @param {boolean} exactTierOnly - `true` if you want to get a given lesson's chars from only the tier provided in `progress`.
 * `false` if you want all tiers up to (less than or equal to) the provided tier.
 * @returns {CharacterOrder & Character} An array of CharacterOrder objects with the corresponding character objects.
 */
async function findAllCharsInLesson(progress, exactTierOnly) {
  try {
    const tierOperator = exactTierOnly ? Op.eq : Op.lte;
    const { tier, lessonNumber } = progress;

    let charsInGivenLesson = await CharacterOrder.findAll({
      where: {
        tier: { [tierOperator]: tier },
        lessonNumber: { [Op.eq]: lessonNumber },
      },
      include: [Character],
      raw: true,
      nest: true,
    });

    charsInGivenLesson.hoistField('character');

    charsInGivenLesson.filterByField('charChinese');

    return charsInGivenLesson;
  } catch (err) {
    throw new HttpError(LESSON_DATABASE_QUERY_FAILED_ERROR, 500);
  }
}

module.exports = {
  findAllCharsInLesson,
};
