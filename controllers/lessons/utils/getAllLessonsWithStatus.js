const HttpError = require('../../../models/http-error');

// const { findAllTiersOfLesson } = require('./findAllTiersOfLesson');

const { findLessonWithChars } = require('./findLessonWithChars');
const { getLessonStatus } = require('./getLessonStatus');

const {
  LESSON_DATABASE_QUERY_FAILED_ERROR,
} = require('../../../util/string-literals');

const { COURSE_FINISHED_TIER } = require('../../../util/config');

/**
 * Takes the Lesson database and queries all info about all versions of all lessons,
 * as well as appending lesson status to each lesson version.
 *
 * @param {Lesson[]} lessonDb - The database of all lessons.
 * @param {Progress} userProgress - The user's progress (tier and lesson number) in the course.
 * @returns {Promise<Lesson[][]>} An array of all versions of all lessons, with the statuses appended.
 */
async function getAllLessonsWithStatus(lessonDb, userProgress) {
  let lessonArray = [];
  let lessonNumber = 1;

  try {
    for (lessonNumber; lessonNumber < lessonDb.length + 1; lessonNumber++) {
      const tiers = await findAllTiersOfLesson(
        lessonNumber,
        userProgress,
        lessonDb
      );

      let lessonObject = {
        lessonNumber,
        name: lessonDb[lessonNumber - 1].name,
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
 * @param {Lesson[]} lessonDatabase - The database of all lessons.
 *
 * @returns {Promise<Lesson[]>} An array of lesson versions, with the status appended.
 */
async function findAllTiersOfLesson(
  lessonNumber,
  userProgress,
  lessonDatabase
) {
  let tierArray = [];

  for (let tier = 1; tier < COURSE_FINISHED_TIER; tier++) {
    const lessonProgress = { tier, lessonNumber };

    let foundLesson = await findLessonWithChars(
      lessonProgress,
      false,
      lessonDatabase
    );

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

module.exports = {
  getAllLessonsWithStatus,
};
