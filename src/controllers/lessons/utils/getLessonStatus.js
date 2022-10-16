import {
  LESSON_LOCKED,
  LESSON_COMPLETED,
  LESSON_UPCOMING,
  LESSON_NOT_IN_TIER,
} from '../../../util/string-literals.js';

import { addMethods, comesLaterThan } from '../../../util/methods.js';

/**
 * @typedef {Object} Character
 *
 * @typedef {Object} Progress
 * @property {number} tier The tier the user is currently at.
 * @property {number} lessonNumber The lesson the user is currently at.
 * @property {number} [indexInLesson] The index of the character the user is currently at.
 * 

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
  addMethods(lessonProgress, [comesLaterThan]);

  return lessonLength === 0
    ? LESSON_NOT_IN_TIER
    : // @ts-ignore
    lessonProgress.comesLaterThan(userProgress)
    ? LESSON_LOCKED
    : lessonProgress.tier === userProgress.tier &&
      lessonProgress.lessonNumber === userProgress.lessonNumber
    ? LESSON_UPCOMING
    : LESSON_COMPLETED;
}

export { getLessonStatus };
