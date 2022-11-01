import { findLessonWithChars } from './findLessonWithChars.js';
import { findCharByCharChinese } from '../../characters/utils/findCharByCharChinese.js';
import {
  LESSON_CHARS_NOT_FOUND_ERROR,
  LESSON_NOT_FOUND_ERROR,
  LESSON_DATABASE_QUERY_FAILED_ERROR,
} from '../../../util/string-literals.js';
import { FullCharacter, Progress } from '../../../util/interfaces.js';
import { throwError } from '../../../util/functions/throwError.js';

/**
 * Gets a lesson, together with the characters within the lesson, based on the user's eligibility.
 *
 * @param progress - The user's progress (tier and lesson number) in the course.
 * @param lessonToView - The lesson number to query. When undefined, queries the user's lessonNumber.
 * @returns An array of lessons, together with the characters within the lesson.
 */
async function getLesson(progress: Progress, lessonToView?: number) {
  const { tier, lessonNumber } = progress;

  const isReview = lessonToView !== undefined;

  const tierToView =
    lessonToView && lessonToView > lessonNumber ? tier - 1 : tier;

  let lesson = await findLessonWithChars(
    { tier: tierToView, lessonNumber: lessonToView ?? lessonNumber },
    isReview
  );

  if (!lesson) {
    throwError({
      message: LESSON_NOT_FOUND_ERROR,
      code: 404,
    });
  }

  let fullCharacters: FullCharacter[] = [];

  try {
    for (const char of lesson.characters) {
      const charChinese = char.getDataValue('charChinese');

      const fullCharacter = await findCharByCharChinese(charChinese, progress);

      if (fullCharacter) {
        fullCharacters.push(fullCharacter);
      }
    }
  } catch (error) {
    throwError({
      message: LESSON_DATABASE_QUERY_FAILED_ERROR,
      code: 500,
    });
  }

  if (fullCharacters.length) {
    lesson.characters = fullCharacters;
    return lesson;
  } else {
    throwError({
      message: LESSON_CHARS_NOT_FOUND_ERROR,
      code: 404,
    });
  }
}

export { getLesson };
