const RevampedLesson = require('../../../models/revamped-lessons');
const HttpError = require('../../../models/http-error');

const {
  LESSON_DATABASE_QUERY_FAILED_ERROR,
} = require('../../../util/string-literals');

/**
 * Queries the database for all lesson objects.
 *
 * @returns {Promise<Lesson[]>} An array of lesson objects.
 */
async function findAllLessonObjects() {
  try {
    const allLessons = await RevampedLesson.findAll({ raw: true, nest: true });

    return allLessons;
  } catch (err) {
    throw new HttpError(LESSON_DATABASE_QUERY_FAILED_ERROR, 500);
  }
}

module.exports = {
  findAllLessonObjects,
};
