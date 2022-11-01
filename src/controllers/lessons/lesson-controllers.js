import { getAllLessonsWithStatus } from './utils/getAllLessonsWithStatus.js';
import { getLesson } from './utils/getLesson.js';
import { getUser } from '../users/utils/getUser.js';
import { getUserProgress } from '../users/utils/getUserProgress.js';
import { passError } from '../../util/functions/throwError.js';
import {
  LESSON_DATABASE_QUERY_FAILED_ERROR,
  LESSON_QUERY_FAILED_ERROR,
} from '../../util/string-literals.js';

async function getLearn(req, res, next) {
  try {
    const progress = await getUserProgress(req);

    const foundLesson = await getLesson(progress);

    res.json(foundLesson);
  } catch (error) {
    passError(
      { error, fallbackMessage: LESSON_QUERY_FAILED_ERROR, fallbackCode: 500 },
      next
    );
  }
}

async function getReview(req, res, next) {
  try {
    const progress = await getUserProgress(req);

    const { lessonToReview } = req.params;

    const foundLesson = await getLesson(progress, lessonToReview);

    res.json(foundLesson);
  } catch (error) {
    passError(
      { error, fallbackMessage: LESSON_QUERY_FAILED_ERROR, fallbackCode: 500 },
      next
    );
  }
}

async function getLessonSelect(req, res, next) {
  try {
    const user = await getUser(req.headers.authorization);

    const userProgress = {
      tier: user.currentTier,
      lessonNumber: user.currentLesson,
    };

    const lessonArray = await getAllLessonsWithStatus(userProgress);

    const currentLessonName = lessonArray.find(
      lesson => lesson.lessonNumber === user.currentLesson
    )?.name;

    res.json({
      lessonArray,
      user,
      currentLessonName,
    });
  } catch (error) {
    passError(
      {
        error,
        fallbackMessage: LESSON_DATABASE_QUERY_FAILED_ERROR,
        fallbackCode: 500,
      },
      next
    );
  }
}

export { getLessonSelect, getLearn, getReview };
