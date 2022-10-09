import RevampedLesson from '../../../models/revamped-lessons.js';
import HttpError from '../../../models/http-error.js';
import { LESSON_DATABASE_QUERY_FAILED_ERROR } from '../../../util/string-literals.js';

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

export { findAllLessonObjects };
