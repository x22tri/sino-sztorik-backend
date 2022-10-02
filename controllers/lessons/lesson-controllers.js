const HttpError = require('../../models/http-error');

const { findAllLessonObjects } = require('./utils/findAllLessonObjects');
const { findCurrentLessonName } = require('./utils/findCurrentLessonName');
const { findLessonWithChars } = require('./utils/findLessonWithChars');
const { getLessonStatus } = require('./utils/getLessonStatus');

const { getUserProgress } = require('../users/utils/getUserProgress');
const { getUser } = require('../users/utils/getUser');
const { addSupplements } = require('../characters/utils/addSupplements');
const { findCharacter } = require('../characters/utils/findCharacter');

const {
  INVALID_REQUEST_ERROR,
  LESSON_NOT_FOUND_ERROR,
  LESSON_DATABASE_QUERY_FAILED_ERROR,
} = require('../../util/string-literals');

const { COURSE_FINISHED_TIER } = require('../../util/config');

// An exported function that gets the lesson corresponding to the requested tier and lessonNumber.
const getLesson = async (req, res, next) => {
  const user = await getUserProgress(req);
  const currentTier = user.tier;
  const currentLesson = user.lessonNumber;

  // Gets the type of request, i.e. what comes after "api/".
  // Is one of "learn" or "review", or else the request doesn't arrive here.
  let requestType = req.originalUrl.split('/')[2];

  // If the requestType is "learn", the user's own currentLesson property is used.
  // If it is "review", we will get a lesson number passed here.
  let lessonToView;
  if (requestType === 'learn') {
    lessonToView = currentLesson;
  } else if (requestType === 'review') {
    lessonToView = req.originalUrl.split('/')[3];
  } else {
    return next(new HttpError(INVALID_REQUEST_ERROR, 500));
  }

  let foundLesson = await findLessonWithChars(
    { tier: currentTier, lessonNumber: lessonToView },
    requestType
  );

  if (!foundLesson) return next(new HttpError(LESSON_NOT_FOUND_ERROR, 404));

  // Converts the charId's to charChinese's and runs "findCharacter" on the ones that aren't already in the lesson.
  let charIDsInLessonArray = [];
  let charChineseArray = [];
  try {
    // console.log(foundLesson.characters);

    for (let j = 0; j < foundLesson.characters.length; j++) {
      // console.log(characters[j])

      let foundCharChinese = foundLesson.characters[j].charChinese;

      // if (charChineseArray.includes(foundCharChinese)) {
      //   continue;
      // } else {
      charChineseArray.push(foundCharChinese);

      const foundChar = await findCharacter(foundCharChinese, user);

      if (foundChar) {
        charIDsInLessonArray.push(foundChar);
      }
      // }
    }
    // Add the characters to the lesson.
    foundLesson.characters = charIDsInLessonArray;
  } catch (err) {
    console.log(err);
    return next(new HttpError(err, err.code || 500));
  }

  res.json({ foundLesson });
};

// An exported function that gets all lessons for the lesson selection screen.
const getLessonSelect = async (req, res, next) => {
  const user = await getUser(req.headers.authorization);

  const userProgress = {
    tier: user.currentTier,
    lessonNumber: user.currentLesson,
  };

  let lessonArray = [];
  let currentLessonName;
  try {
    let lessonDatabase = await findAllLessonObjects();

    // Iterates over all lessonNumbers and tiers to get all lessons.
    for (
      let lessonNumber = 1;
      lessonNumber < lessonDatabase.length + 1;
      lessonNumber++
    ) {
      let lessonObject = {
        lessonNumber: lessonNumber,
        name: lessonDatabase[lessonNumber - 1].name,
        tiers: [],
      };
      for (let tier = 1; tier < COURSE_FINISHED_TIER; tier++) {
        const lessonProgress = { tier: tier, lessonNumber: lessonNumber };

        let foundLesson = await findLessonWithChars(
          lessonProgress,
          'lesson-select',
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

          lessonObject.tiers.push(foundLesson);
        }
      }
      // The object created has this approximate shape:
      // { lessonNumber: 1, name: '', tiers: [{tier: 1, preface: prefaceTier1, characters: [{...}, {...}], status: ''}, {tier: 2,...}] }
      lessonArray.push(lessonObject);
    }
  } catch (err) {
    return next(new HttpError(LESSON_DATABASE_QUERY_FAILED_ERROR, 500));
  }

  currentLessonName = findCurrentLessonName(lessonArray, user.currentLesson);

  res.json({
    lessonArray,
    user: {
      displayName: user.displayName,
      currentTier: user.currentTier,
      currentLesson: user.currentLesson,
      currentLessonName: currentLessonName,
    },
  });
};

module.exports = {
  getLesson,
  findLessonWithChars,
  getLessonSelect,
};
