const HttpError = require('../../../models/http-error');

const { findAllCharsInLesson } = require('./findAllCharsInLesson');
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

module.exports = {
  findLessonWithChars,
};
