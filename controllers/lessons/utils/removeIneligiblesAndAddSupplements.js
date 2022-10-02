const HttpError = require('../../../models/http-error');

const { findCharacter } = require('../../characters/utils/findCharacter');

const {
  LESSON_DATABASE_QUERY_FAILED_ERROR,
} = require('../../../util/string-literals');

async function removeIneligiblesAndAddSupplements(lessonObject, userProgress) {
  try {
    let charIDsInLessonArray = [];

    for (const charInLesson of lessonObject.characters) {
      const charInLessonChinese = charInLesson.charChinese;

      const fullChar = await findCharacter(charInLessonChinese, userProgress);

      if (fullChar) {
        charIDsInLessonArray.push(fullChar);
      }
    }

    return charIDsInLessonArray;
  } catch (err) {
    throw new HttpError(LESSON_DATABASE_QUERY_FAILED_ERROR, 500);
  }
}

module.exports = {
  removeIneligiblesAndAddSupplements,
};
