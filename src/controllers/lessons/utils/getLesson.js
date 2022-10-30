import HttpError from '../../../models/http-error.js';
import { findLessonWithChars } from './findLessonWithChars.js';
import { findCharByCharChinese } from '../../characters/utils/findCharByCharChinese.js';

import {
  LESSON_CHARS_NOT_FOUND_ERROR,
  LESSON_NOT_FOUND_ERROR,
  LESSON_DATABASE_QUERY_FAILED_ERROR,
} from '../../../util/string-literals.js';

import Character from '../../../models/characters.js';

/**
 
 * @typedef {Object} Lesson
 *
 * @typedef {Object} Progress
 * @property {number} tier The tier the user is currently at.
 * @property {number} lessonNumber The lesson the user is currently at.
 * @property {number} [indexInLesson] The index of the character the user is currently at.
 * /

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

  const tierToView =
    lessonToView && lessonToView > lessonNumber ? tier - 1 : tier;

  let lesson = await findLessonWithChars(
    { tier: tierToView, lessonNumber: lessonToView ?? lessonNumber },
    isReview
  );

  if (!lesson) {
    throw new HttpError(LESSON_NOT_FOUND_ERROR, 404);
  }

  let fullChars = [];

  try {
    for (const { charChinese } of lesson.characters) {
      const fullChar = await findCharByCharChinese(charChinese, progress);

      if (fullChar) {
        fullChars.push(fullChar);
      }
    }
  } catch (err) {
    throw new HttpError(err, 500);
  }

  if (fullChars.length) {
    lesson.characters = fullChars;
    return lesson;
  } else {
    throw new HttpError(LESSON_CHARS_NOT_FOUND_ERROR, 404);
  }
}

export { getLesson };
