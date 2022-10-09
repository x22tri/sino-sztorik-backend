import {
  LESSON_LOCKED,
  LESSON_COMPLETED,
  LESSON_UPCOMING,
  LESSON_NOT_IN_TIER,
} from '../../../util/string-literals.js';

/**
 * Takes a lesson (with progress state and length) and the user's progress in the course,
 * and returns the lesson's "status".
 *
 * @param {Progress} userProgress - The user's progress state (tier and lesson number).
 * @param {Progress} lessonProgress - The lesson's progress state (tier and lesson number).
 * @param {number} lessonLength - The length of the array containing the characters from the requested lesson.
 * @returns {LESSON_NOT_IN_TIER | LESSON_LOCKED | LESSON_UPCOMING | LESSON_COMPLETED} The lesson's status.
 */
function getLessonStatus(userProgress, lessonProgress, lessonLength) {
  return lessonLength === 0
    ? LESSON_NOT_IN_TIER
    : lessonProgress.comesLaterThan(userProgress)
    ? LESSON_LOCKED
    : lessonProgress.tier === userProgress.tier &&
      lessonProgress.lessonNumber === userProgress.lessonNumber
    ? LESSON_UPCOMING
    : LESSON_COMPLETED;
}

export { getLessonStatus };
