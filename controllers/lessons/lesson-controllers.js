const { findAllLessonObjects } = require('./utils/findAllLessonObjects');
const { findCurrentLessonName } = require('./utils/findCurrentLessonName');
const { getAllLessonsWithStatus } = require('./utils/getAllLessonsWithStatus');
const { getLesson } = require('./utils/getLesson');
const { getUser } = require('../users/utils/getUser');
const { getUserProgress } = require('../users/utils/getUserProgress');

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

    const lessonDatabase = await findAllLessonObjects();

    const lessonArray = await getAllLessonsWithStatus(
      lessonDatabase,
      userProgress
    );

    const currentLessonName = findCurrentLessonName(
      lessonArray,
      user.currentLesson
    );

    res.json({
      lessonArray,
      user: {
        displayName: user.displayName,
        currentTier: user.currentTier,
        currentLesson: user.currentLesson,
        currentLessonName: currentLessonName,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLessonSelect,
  getLearn,
  getReview,
};
