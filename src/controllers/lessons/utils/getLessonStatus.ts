import { Progress, AssembledLesson } from '../../../util/interfaces.js';
import { LessonStatuses } from '../../../util/enums.js';
const { NOT_IN_TIER, LOCKED, UPCOMING, COMPLETED } = LessonStatuses;

type LessonStatus = typeof LessonStatuses[keyof typeof LessonStatuses];

/**
 * Takes a lesson (with progress state and length) and the user's progress in the course,
 * and returns the lesson's "status".
 *
 * @param userProgress - The user's progress state (tier and lesson number).
 * @param lessonProgress - The lesson's progress state (tier and lesson number).
 * @returns The lesson's status.
 */
function getLessonStatus(
  userProgress: Progress,
  lesson: AssembledLesson
): LessonStatus {
  return lesson.characters.length === 0
    ? NOT_IN_TIER
    : lesson.comesLaterThan(userProgress)
    ? LOCKED
    : lesson.tier === userProgress.tier &&
      lesson.lessonNumber === userProgress.lessonNumber
    ? UPCOMING
    : COMPLETED;
}

export { getLessonStatus };
