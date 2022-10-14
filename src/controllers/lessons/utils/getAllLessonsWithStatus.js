import HttpError from '../../../models/http-error.js';

import { findLessonWithChars } from './findLessonWithChars.js';
import { getLessonStatus } from './getLessonStatus.js';
import { findAllLessonObjects } from './findAllLessonObjects.js';
import { LESSON_DATABASE_QUERY_FAILED_ERROR } from '../../../util/string-literals.js';
import { COURSE_FINISHED_TIER } from '../../../util/config.js';

/**
 * Takes the Lesson database and queries all info about all versions of all lessons,
 * as well as appending lesson status to each lesson version.
 *
 * @param {Progress} userProgress - The user's progress (tier and lesson number) in the course.
 * @returns {Promise<Lesson[][]>} An array of all versions of all lessons, with the statuses appended.
 */
async function getAllLessonsWithStatus(userProgress) {
  let lessonArray = [];
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
 * @returns {Promise<Lesson[]>} An array of lesson versions, with the status appended.
 */
async function findAllTiersOfLesson(lessonNumber, userProgress) {
  let tierArray = [];

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
      };

      tierArray.push(foundLesson);
    }
  }

  return tierArray;
}

export { getAllLessonsWithStatus };
