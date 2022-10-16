import { Op } from 'sequelize';
const { gt } = Op;

import CharacterOrder from '../../../models/character-orders.js';
import HttpError from '../../../models/http-error.js';
import { getCharProgress } from '../../characters/utils/getCharProgress.js';
import { LAST_TIER, COURSE_FINISHED } from '../../../util/config.js';
import { NEXT_LESSON_NOT_FOUND_ERROR } from '../../../util/string-literals.js';

async function findNextLesson(currentTier, currentLesson) {
  const nextLessonInTier = await lookForLessonInSameTier(
    currentTier,
    currentLesson
  );

  if (nextLessonInTier) {
    return nextLessonInTier;
  }

  const firstLessonInNextTier = await lookForLessonInNextTier(currentTier);

  if (firstLessonInNextTier) {
    return firstLessonInNextTier;
  }

  if (currentTier === LAST_TIER) {
    return COURSE_FINISHED;
  }

  throw new HttpError(NEXT_LESSON_NOT_FOUND_ERROR, 404);
}

async function lookForLessonInSameTier(currentTier, currentLesson) {
  const remainingLessonsInTier = await CharacterOrder.findAll({
    where: { tier: currentTier, lessonNumber: { [gt]: currentLesson } },
    order: ['lessonNumber'],
    raw: true,
  });

  const nextLessonInSameTierChar = remainingLessonsInTier?.[0];

  if (!nextLessonInSameTierChar) {
    return null;
  }

  const nextLessonInSameTier = getCharProgress(nextLessonInSameTierChar);

  if (!isValidProgress(nextLessonInSameTier)) {
    return null;
  }

  return {
    tier: nextLessonInSameTier.tier,
    lessonNumber: nextLessonInSameTier.lessonNumber,
  };
}

async function lookForLessonInNextTier(currentTier) {
  const lessonsInNextTier = await CharacterOrder.findAll({
    where: { tier: currentTier + 1 },
    order: ['lessonNumber'],
  });

  const firstLessonInNextTierChar = lessonsInNextTier?.[0];

  if (!firstLessonInNextTierChar) {
    return null;
  }

  const firstLessonInNextTier = getCharProgress(firstLessonInNextTierChar);

  if (!isValidProgress(firstLessonInNextTier)) {
    return null;
  }

  return {
    tier: firstLessonInNextTier.tier,
    lessonNumber: firstLessonInNextTier.lessonNumber,
  };
}

function isValidProgress(progress) {
  return (
    Number.isInteger(progress?.tier) && Number.isInteger(progress?.lessonNumber)
  );
}

export { findNextLesson };