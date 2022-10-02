const HttpError = require('../../../models/http-error');

const { findAllTiersOfLesson } = require('./findAllTiersOfLesson');

const {
  LESSON_DATABASE_QUERY_FAILED_ERROR,
} = require('../../../util/string-literals');

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

module.exports = {
  getAllLessonsWithStatus,
};
