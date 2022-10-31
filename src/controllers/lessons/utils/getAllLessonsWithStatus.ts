import HttpError from '../../../models/http-error.js';

import { findLessonWithChars } from './findLessonWithChars.js';
import { getLessonStatus } from './getLessonStatus.js';
import { findAllLessonObjects } from './findAllLessonObjects.js';
import { COURSE_FINISHED_TIER } from '../../../util/config.js';

import { AssembledLesson } from '../../../util/classes/AssembledLesson.js';
import { AssembledLessonAllTiers } from '../../../util/interfaces.js';
import { Progress } from '../../../util/interfaces.js';

/**
 * Takes the Lesson database and queries all info about all versions of all lessons,
 * as well as appending lesson status to each lesson version.
 *
 * @param userProgress - The user's progress (tier and lesson number) in the course.
 * @returns An array of all versions of all lessons, with the statuses appended.
 */
async function getAllLessonsWithStatus(userProgress: Progress) {
  let lessonArray: AssembledLessonAllTiers[] = [];
  const lessonDb = await findAllLessonObjects();

  try {
    for (let lessonIndex = 0; lessonIndex < lessonDb.length; lessonIndex++) {
      const lessonNumber = lessonIndex + 1;

      const tiers = await findAllTiersOfLesson(lessonNumber, userProgress);

      const lessonObject: AssembledLessonAllTiers = {
        lessonNumber,
        name: lessonDb[lessonIndex].name,
        tiers,
      };

      lessonArray.push(lessonObject);
    }
  } catch (err) {
    throw new HttpError(err, 500);
  }

  return lessonArray;
}

/**
 * Queries all tier versions of a given lesson after being provided a lesson number.
 * Also appends lesson status.
 *
 * @param lessonNumber - The lesson number to get all versions of.
 * @param userProgress - The user's progress (tier and lesson number) in the course.
 * @returns An array of lesson versions, with the status appended.
 */
async function findAllTiersOfLesson(
  lessonNumber: number,
  userProgress: Progress
) {
  let tierArray: AssembledLesson[] = [];

  for (let tier = 1; tier < COURSE_FINISHED_TIER; tier++) {
    const lessonProgress = { tier, lessonNumber };

    let foundLesson = await findLessonWithChars(lessonProgress, false);

    if (foundLesson) {
      const lessonStatus = getLessonStatus(userProgress, foundLesson);

      foundLesson.status = lessonStatus;

      tierArray.push(foundLesson);
    }
  }

  return tierArray;
}

export { getAllLessonsWithStatus };
