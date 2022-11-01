import { getAllLessonsWithStatus } from './utils/getAllLessonsWithStatus.js';
import { getLesson } from './utils/getLesson.js';
import { getUser } from '../users/utils/getUser.js';
import { passError, throwError } from '../../util/functions/throwError.js';
import {
  INVALID_NUMBERS_PROVIDED,
  LESSON_DATABASE_QUERY_FAILED_ERROR,
  LESSON_QUERY_FAILED_ERROR,
} from '../../util/string-literals.js';
import { Request, Response, NextFunction } from 'express';

async function getLearn(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    const user = await getUser(authHeader);

    const progress = user.getProgress();

    const foundLesson = await getLesson(progress);

    res.json(foundLesson);
  } catch (error) {
    passError(
      { error, fallbackMessage: LESSON_QUERY_FAILED_ERROR, fallbackCode: 500 },
      next
    );
  }
}

async function getReview(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    const user = await getUser(authHeader);

    const progress = user.getProgress();

    const { lessonToReview } = req.params;

    const lessonNumberToReview = Number(lessonToReview);

    if (Number.isNaN(lessonNumberToReview)) {
      throwError({ message: INVALID_NUMBERS_PROVIDED, code: 400 });
    }

    const foundLesson = await getLesson(progress, lessonNumberToReview);

    res.json(foundLesson);
  } catch (error) {
    passError(
      { error, fallbackMessage: LESSON_QUERY_FAILED_ERROR, fallbackCode: 500 },
      next
    );
  }
}

async function getLessonSelect(
  req: Request,
  res: Response,
  next: NextFunction
) {
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
