const { findLessonWithChars } = require('./findLessonWithChars');
const { getLessonStatus } = require('./getLessonStatus');

const { COURSE_FINISHED_TIER } = require('../../../util/config');

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
  findAllTiersOfLesson,
};
