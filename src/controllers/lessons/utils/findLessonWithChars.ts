import { Op } from 'sequelize';
const { eq, lte } = Op;

import { CharacterOrder } from '../../../models/character-orders.js';
import Character from '../../../models/characters.js';
import { findAllLessonObjects } from './findAllLessonObjects.js';
import { LESSON_DATABASE_QUERY_FAILED_ERROR } from '../../../util/string-literals.js';
import { LESSON_PREFACE_TIER_PREFIX } from '../../../util/config.js';
import lessonsCache from '../lessons-cache.js';
import { deduplicate } from '../../../util/functions/deduplicate.js';
import { Progress } from '../../../util/interfaces.js';
import { AssembledLesson } from '../../../util/classes/AssembledLesson.js';
import { throwError } from '../../../util/functions/throwError.js';

/**
 * Based on a lesson's progress state (tier and lesson number), finds the lesson object
 * and all characters within the lesson.
 *
 * @param lessonProgress - The lesson's progress state (tier and lesson number).
 * @param isReview - `true` if the request arrives from a lesson review request, `false` otherwise.
 * @returns The found lesson.
 */
async function findLessonWithChars(
  lessonProgress: Progress,
  isReview?: boolean
) {
  try {
    const { tier, lessonNumber } = lessonProgress;

    const lessonDatabase = lessonsCache.get() ?? (await findAllLessonObjects());

    const givenLesson = lessonDatabase[lessonNumber - 1];

    const charsInGivenLesson = await _findAllCharsInLesson(
      { tier, lessonNumber },
      !isReview
    );

    return new AssembledLesson({
      tier,
      lessonNumber,
      name: givenLesson.name,
      preface: givenLesson[LESSON_PREFACE_TIER_PREFIX + tier],
      characters: charsInGivenLesson,
    });
  } catch (error) {
    throwError({
      error,
      message: LESSON_DATABASE_QUERY_FAILED_ERROR,
      code: 500,
    });
  }
}

/**
 * Takes a progress state and returns the characters in the given lesson.
 *
 * @param progress - The progress state (tier and lesson number) to query.
 * @param exactTierOnly - `true` if you want to get a given lesson's chars from only the tier provided in `progress`.
 * `false` if you want all tiers up to (less than or equal to) the provided tier.
 * @returns An array of CharacterOrder objects with the corresponding character objects.
 */
async function _findAllCharsInLesson(
  progress: Progress,
  exactTierOnly: boolean
) {
  try {
    const tierOperator = exactTierOnly ? eq : lte;
    const { tier, lessonNumber } = progress;

    let charsInGivenLesson = await CharacterOrder.findAllAndHoist({
      where: {
        tier: { [tierOperator]: tier },
        lessonNumber: { [eq]: lessonNumber },
      },
      include: Character,
    });

    deduplicate({ array: charsInGivenLesson, byField: 'charChinese' });

    return charsInGivenLesson;
  } catch (error) {
    throwError({
      error,
      message: LESSON_DATABASE_QUERY_FAILED_ERROR,
      code: 500,
    });
  }
}

export { findLessonWithChars };
