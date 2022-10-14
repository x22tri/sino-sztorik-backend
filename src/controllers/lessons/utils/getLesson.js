import HttpError from '../../../models/http-error.js';
import { findLessonWithChars } from './findLessonWithChars.js';
import { addSupplements } from '../../characters/utils/addSupplements.js';

import {
  LESSON_CHARS_NOT_FOUND_ERROR,
  LESSON_NOT_FOUND_ERROR,
  LESSON_DATABASE_QUERY_FAILED_ERROR,
} from '../../../util/string-literals.js';

/**
 * Gets a lesson, together with the characters within the lesson, based on the user's eligibility.
 *
 * @param {Progress} progress - The user's progress (tier and lesson number) in the course
 * @param {number} [lessonToView] - The lesson number to query. When undefined, queries the user's lessonNumber.
 * @returns {Promise<Lesson & Character[]>} An array of lessons, together with the characters within the lesson.
 */
async function getLesson(progress, lessonToView = undefined) {
  const { tier, lessonNumber } = progress;

  const isReview = lessonToView !== undefined;

  const tierToView = lessonToView > lessonNumber ? tier - 1 : tier;

  let lesson = await findLessonWithChars(
    { tier: tierToView, lessonNumber: lessonToView ?? lessonNumber },
    isReview
  );

  if (!lesson) {
    throw new HttpError(LESSON_NOT_FOUND_ERROR, 404);
  }

  let charsWithSupplements = [];

  try {
    for (const charInLesson of lesson.characters) {
      const characterWithSupplements = await addSupplements(charInLesson);

      if (characterWithSupplements) {
        charsWithSupplements.push(characterWithSupplements);
      }
    }
  } catch (err) {
    throw new HttpError(LESSON_DATABASE_QUERY_FAILED_ERROR, 500);
  }

  if (charsWithSupplements.length) {
    lesson.characters = charsWithSupplements;
  } else {
    throw new HttpError(LESSON_CHARS_NOT_FOUND_ERROR, 404);
  }

  return lesson;
}

export { getLesson };
