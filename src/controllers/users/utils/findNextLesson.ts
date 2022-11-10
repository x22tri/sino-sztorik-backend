import { Op } from 'sequelize';
const { gt } = Op;

import CharacterOrder from '../../../models/character-orders.js';
import { LAST_TIER, COURSE_FINISHED } from '../../../util/config.js';
import { NEXT_LESSON_NOT_FOUND_ERROR } from '../../../util/string-literals.js';
import { throwError } from '../../../util/functions/throwError.js';
import { Progress } from '../../../util/interfaces.js';

async function findNextLesson(currentTier: number, currentLesson: number) {
  const nextLessonInTier = await _lookForLessonInSameTier(
    currentTier,
    currentLesson
  );

  if (nextLessonInTier) {
    return nextLessonInTier;
  }

  const firstLessonInNextTier = await _lookForLessonInNextTier(currentTier);

  if (firstLessonInNextTier) {
    return firstLessonInNextTier;
  }

  if (currentTier === LAST_TIER) {
    return COURSE_FINISHED;
  }

  throwError({ message: NEXT_LESSON_NOT_FOUND_ERROR, code: 404 });
}

async function _lookForLessonInSameTier(
  currentTier: number,
  currentLesson: number
): Promise<Progress | null> {
  const remainingLessonsInTier = await CharacterOrder.findAll({
    where: { tier: currentTier, lessonNumber: { [gt]: currentLesson } },
    order: ['lessonNumber'],
  });

  const nextLessonInSameTierChar = remainingLessonsInTier?.[0];

  if (!nextLessonInSameTierChar) {
    return null;
  }

  return {
    ...nextLessonInSameTierChar.getProgress(),
    indexInLesson: undefined,
  };
}

async function _lookForLessonInNextTier(
  currentTier: number
): Promise<Progress | null> {
  const lessonsInNextTier = await CharacterOrder.findAll({
    where: { tier: currentTier + 1 },
    order: ['lessonNumber'],
  });

  const firstLessonInNextTierChar = lessonsInNextTier?.[0];

  if (!firstLessonInNextTierChar) {
    return null;
  }

  return {
    ...firstLessonInNextTierChar.getProgress(),
    indexInLesson: undefined,
  };
}

export { findNextLesson };
