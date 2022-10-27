import { getAllLessonsWithStatus } from './utils/getAllLessonsWithStatus.js';
import { getLesson } from './utils/getLesson.js';
import { getUser } from '../users/utils/getUser.js';
import { getUserProgress } from '../users/utils/getUserProgress.js';

async function getLearn(req, res, next) {
  try {
    const progress = await getUserProgress(req);

    const foundLesson = await getLesson(progress);

    res.json(foundLesson);
  } catch (err) {
    next(err);
  }
}

async function getReview(req, res, next) {
  try {
    const progress = await getUserProgress(req);

    const { lessonToReview } = req.params;

    const foundLesson = await getLesson(progress, lessonToReview);

    res.json(foundLesson);
  } catch (err) {
    next(err);
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
  } catch (err) {
    next(err);
  }
}

export { getLessonSelect, getLearn, getReview };
