const HttpError = require('../../../models/http-error');

const { ADVANCE_USER_FAILED_ERROR } = require('../../../util/string-literals');

async function updateUserInDatabase(user, nextLesson) {
  try {
    await user.update({
      currentTier: nextLesson.tier,
      currentLesson: nextLesson.lessonNumber,
    });

    return nextLesson;
  } catch (err) {
    throw new HttpError(ADVANCE_USER_FAILED_ERROR, 500);
  }
}

module.exports = {
  updateUserInDatabase,
};
