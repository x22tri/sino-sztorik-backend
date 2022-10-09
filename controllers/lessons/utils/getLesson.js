import HttpError from '../../../models/http-error.js';
import { findCharacter } from '../../characters/utils/findCharacter.js';
import { findLessonWithChars } from './findLessonWithChars.js';

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

  let tierToView = lessonToView > lessonNumber ? tier - 1 : tier;

  let lesson = await findLessonWithChars(
    { tier: tierToView, lessonNumber: lessonToView ?? lessonNumber },
    lessonToView !== undefined
  );

  if (!lesson) {
    throw new HttpError(LESSON_NOT_FOUND_ERROR, 404);
  }

  const chars = await removeIneligiblesAndAddSupplements(lesson, progress);

  if (chars) {
    lesson.characters = chars;
  } else {
    throw new HttpError(LESSON_CHARS_NOT_FOUND_ERROR, 404);
  }

  return lesson;
}

/**
 * Takes a lesson object and runs findCharacter on its characters to filter out the ones that user is ineligible to see,
 * as well as to add supplemental information.
 *
 * @param {Lesson} lessonObject - The lesson object to process.
 * @param {Progress} userProgress - The user's progress (tier and lesson number) in the course.
 * @returns {Promise<Character[]>} An array of characters.
 */
async function removeIneligiblesAndAddSupplements(lessonObject, userProgress) {
  try {
    let filteredChars = [];

    for (const charInLesson of lessonObject.characters) {
      const charInLessonChinese = charInLesson.charChinese;

      const fullChar = await findCharacter(charInLessonChinese, userProgress);

      if (fullChar) {
        filteredChars.push(fullChar);
      }
    }

    return filteredChars;
  } catch (err) {
    throw new HttpError(LESSON_DATABASE_QUERY_FAILED_ERROR, 500);
  }
}

export { getLesson };
