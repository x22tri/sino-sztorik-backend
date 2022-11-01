import User from '../../../models/users.js';
import { throwError } from '../../../util/functions/throwError.js';
import { Progress } from '../../../util/interfaces.js';
import { ADVANCE_USER_FAILED_ERROR } from '../../../util/string-literals.js';

async function updateUserInDatabase(user: User, nextLesson: Progress) {
  try {
    await user.update({
      currentTier: nextLesson.tier,
      currentLesson: nextLesson.lessonNumber,
    });

    return nextLesson;
  } catch (error) {
    throwError({
      error,
      message: ADVANCE_USER_FAILED_ERROR,
      code: 500,
    });
  }
}

export { updateUserInDatabase };
