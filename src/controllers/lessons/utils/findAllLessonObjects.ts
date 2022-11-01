import Lesson from '../../../models/lessons.js';
import { LESSON_DATABASE_QUERY_FAILED_ERROR } from '../../../util/string-literals.js';
import lessonsCache from '../lessons-cache.js';
import { throwError } from '../../../util/functions/throwError.js';

/**
 * Queries the database for all lesson objects.
 *
 * @returns An array of lesson objects.
 */
async function findAllLessonObjects(): Promise<Lesson[]> {
  try {
    const allLessonsCached = lessonsCache.get();

    if (allLessonsCached) {
      return allLessonsCached;
    }

    const allLessons = await Lesson.findAll({ raw: true, nest: true });

    lessonsCache.save(allLessons);

    return allLessons;
  } catch (error) {
    throwError({
      error,
      message: LESSON_DATABASE_QUERY_FAILED_ERROR,
      code: 500,
    });
  }
}

export { findAllLessonObjects };
