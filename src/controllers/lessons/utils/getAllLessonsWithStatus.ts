import HttpError from '../../../models/http-error.js';

import { findLessonWithChars } from './findLessonWithChars.js';
import { getLessonStatus } from './getLessonStatus.js';
import { findAllLessonObjects } from './findAllLessonObjects.js';
import { LESSON_DATABASE_QUERY_FAILED_ERROR } from '../../../util/string-literals.js';
import { COURSE_FINISHED_TIER } from '../../../util/config.js';

import RevampedLesson from '../../../models/revamped-lessons.js';

import {
  LESSON_LOCKED,
  LESSON_COMPLETED,
  LESSON_UPCOMING,
  LESSON_NOT_IN_TIER,
} from '../../../util/string-literals.js';
import Character from '../../../models/characters.js';
import { CharacterOrder } from '../../../models/character-orders.js';

interface AssembledLesson {
  tier: number;
  lessonNumber: number;
  name: string;
  preface: string;
  characters: (CharacterOrder & Character)[];
  status?: string;
}

interface AssembledLessonAllTiers {
  lessonNumber: number;
  name: any;
  tiers: AssembledLesson[];
}

/**
 *  @typedef {Object} Lesson
 * @typedef {Object} Progress
 * @property {number} tier The tier the user is currently at.
 * @property {number} lessonNumber The lesson the user is currently at.
 * @property {number} [indexInLesson] The index of the character the user is currently at.
 ** /

/**
 * Takes the Lesson database and queries all info about all versions of all lessons,
 * as well as appending lesson status to each lesson version.
 *
 * @param {Progress} userProgress - The user's progress (tier and lesson number) in the course.
 * @returns {Promise<AssembledLessonAllTiers[]>} An array of all versions of all lessons, with the statuses appended.
 */
async function getAllLessonsWithStatus(
  userProgress
): Promise<AssembledLessonAllTiers[]> {
  let lessonArray: AssembledLessonAllTiers[] = [];
  const lessonDb = await findAllLessonObjects();

  try {
    for (let lessonIndex = 0; lessonIndex < lessonDb.length; lessonIndex++) {
      let lessonNumber = lessonIndex + 1;

      const tiers = await findAllTiersOfLesson(lessonNumber, userProgress);

      const lessonObject = {
        lessonNumber,
        name: lessonDb[lessonIndex].name,
        tiers,
      };

      lessonArray.push(lessonObject);
    }
  } catch (err) {
    throw new HttpError(LESSON_DATABASE_QUERY_FAILED_ERROR, 500);
  }

  return lessonArray;
}

/**
 * Queries all tier versions of a given lesson after being provided a lesson number.
 * Also appends lesson status.
 *
 * @param {number} lessonNumber - The lesson number to get all versions of.
 * @param {Progress} userProgress - The user's progress (tier and lesson number) in the course.
 *
 * @returns {Promise<AssembledLesson[]>} An array of lesson versions, with the status appended.
 */
async function findAllTiersOfLesson(
  lessonNumber: number,
  userProgress
): Promise<AssembledLesson[]> {
  let tierArray: AssembledLesson[] = [];

  for (let tier = 1; tier < COURSE_FINISHED_TIER; tier++) {
    const lessonProgress = { tier, lessonNumber };

    let foundLesson = await findLessonWithChars(lessonProgress, false);

    if (foundLesson) {
      const lessonStatus = getLessonStatus(
        userProgress,
        lessonProgress,
        foundLesson.characters.length
      );

      foundLesson = {
        ...foundLesson,
        status: lessonStatus,
      } as AssembledLesson;

      tierArray.push(foundLesson);
    }
  }

  return tierArray;
}

export { getAllLessonsWithStatus };
