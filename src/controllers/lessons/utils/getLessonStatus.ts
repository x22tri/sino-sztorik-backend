import { Progress } from '../../../util/interfaces.js';
import { AssembledLesson } from '../../../util/classes/AssembledLesson.js';
import { LessonStatuses } from '../../../util/enums.js';
const { NOT_IN_TIER, LOCKED, UPCOMING, COMPLETED } = LessonStatuses;

/**
 * Takes a lesson (with progress state and length) and the user's progress in the course,
 * and returns the lesson's "status".
 *
 * @param userProgress - The user's progress state (tier and lesson number).
 * @param lesson - The lesson's progress state (tier and lesson number).
 * @returns The lesson's status.
 */
function getLessonStatus(userProgress: Progress, lesson: AssembledLesson) {
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
