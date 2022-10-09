const { eq, lte } = require('sequelize').Op;
const CharacterOrder = require('../../../models/character-orders');
const Character = require('../../../models/characters');
const HttpError = require('../../../models/http-error');

const { findAllLessonObjects } = require('./findAllLessonObjects');

const {
  LESSON_DATABASE_QUERY_FAILED_ERROR,
} = require('../../../util/string-literals');

const { LESSON_PREFACE_TIER_PREFIX } = require('../../../util/config');

/**
 * Based on a lesson's progress state (tier and lesson number), finds the lesson object
 * and all characters within the lesson.
 *
 * @param {Progress} lessonProgress - The lesson's progress state (tier and lesson number).
 * @param {boolean} isReview - `true` if the request arrives from a lesson review request, `false` otherwise.
 * @param {Lesson[]} [lessonDb] - The lesson database, if it has already been queried during an earlier function,
 * can optionally be passed to this function to avoid expensive re-querying.
 * @returns {Promise<Lesson & Character>} The found lesson.
 */
async function findLessonWithChars(lessonProgress, isReview, lessonDb) {
  try {
    const { tier, lessonNumber } = lessonProgress;

    const lessonDatabase = lessonDb ?? (await findAllLessonObjects());

    const givenLesson = lessonDatabase[lessonNumber - 1];

    const charsInGivenLesson = await findAllCharsInLesson(
      { tier, lessonNumber },
      !isReview
    );

    return {
      tier,
      lessonNumber,
      name: givenLesson.name,
      preface: givenLesson[LESSON_PREFACE_TIER_PREFIX + tier],
      characters: charsInGivenLesson,
    };
  } catch (err) {
    return new HttpError(LESSON_DATABASE_QUERY_FAILED_ERROR, 500);
  }
}

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
    const tierOperator = exactTierOnly ? eq : lte;
    const { tier, lessonNumber } = progress;

    let charsInGivenLesson = await CharacterOrder.findAll({
      where: {
        tier: { [tierOperator]: tier },
        lessonNumber: { [eq]: lessonNumber },
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
  findLessonWithChars,
};
