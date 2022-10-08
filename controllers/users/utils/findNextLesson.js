const { gt } = require('sequelize').Op;

const CharacterOrder = require('../../../models/character-orders');
const HttpError = require('../../../models/http-error');

const { getCharProgress } = require('../../characters/utils/getCharProgress');

const { LAST_TIER, COURSE_FINISHED } = require('../../../util/config');

const {
  NEXT_LESSON_NOT_FOUND_ERROR,
} = require('../../../util/string-literals');

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

module.exports = {
  findNextLesson,
};
