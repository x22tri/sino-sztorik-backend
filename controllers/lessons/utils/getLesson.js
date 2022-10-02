const HttpError = require('../../../models/http-error');

const {
  removeIneligiblesAndAddSupplements,
} = require('./removeIneligiblesAndAddSupplements');

const { findLessonWithChars } = require('./findLessonWithChars');

const {
  LESSON_CHARS_NOT_FOUND_ERROR,
  LESSON_NOT_FOUND_ERROR,
} = require('../../../util/string-literals');

async function getLesson(progress, lessonToView = undefined) {
  const { tier, lessonNumber } = progress;

  let lesson = await findLessonWithChars(
    { tier, lessonNumber: lessonToView ?? lessonNumber },
    lessonToView !== undefined
  );

  if (!lesson) {
    throw new HttpError(LESSON_NOT_FOUND_ERROR, 404);
  }

  const chars = await removeIneligiblesAndAddSupplements(lesson, progress);

  if (chars) {
    lesson.characters = chars;
  } else {
    throw new HttpError(LESSON_CHARS_NOT_FOUND_ERROR, 404);
  }

  return lesson;
}

module.exports = {
  getLesson,
};
