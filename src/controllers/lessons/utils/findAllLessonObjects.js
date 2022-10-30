import RevampedLesson from '../../../models/revamped-lessons.js';
import HttpError from '../../../models/http-error.js';
import { LESSON_DATABASE_QUERY_FAILED_ERROR } from '../../../util/string-literals.js';
import lessonsCache from '../lessons-cache.js';

/**
 * @typedef {Object} Lesson
 * /

/**
 * Queries the database for all lesson objects.
 *
 * @returns {Promise<Lesson[]>} An array of lesson objects.
 */
async function findAllLessonObjects() {
  try {
    const allLessonsCached = lessonsCache.get();

    if (allLessonsCached) {
      return allLessonsCached;
    }

    const allLessons = await RevampedLesson.findAll({ raw: true, nest: true });
    lessonsCache.save(allLessons);

    return allLessons;
  } catch (err) {
    throw new HttpError(err, 500);
  }
}

export { findAllLessonObjects };
