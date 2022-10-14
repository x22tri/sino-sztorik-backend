import HttpError from '../../../models/http-error.js';
import { ADVANCE_USER_FAILED_ERROR } from '../../../util/string-literals.js';

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

export { updateUserInDatabase };
