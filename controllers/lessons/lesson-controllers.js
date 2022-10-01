const { Op } = require('sequelize');
const RevampedLesson = require('../../models/revamped-lessons');

const Character = require('../../models/characters');
const CharacterOrder = require('../../models/character-orders');
const HttpError = require('../../models/http-error');

const { findCharacter } = require('../characters/utils/findCharacter');
const { getUserProgress } = require('../users/utils/getUserProgress');

const {
  INVALID_REQUEST_ERROR,
  LESSON_NOT_FOUND_ERROR,
  LESSON_DATABASE_QUERY_FAILED_ERROR,
  LESSON_LOCKED,
  LESSON_COMPLETED,
  LESSON_UPCOMING,
  LESSON_NOT_IN_TIER,
} = require('../../util/string-literals');

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

  let foundLesson = await findLessonHelper(
    currentTier,
    currentTier,
    lessonToView,
    currentLesson,
    requestType
  );
  if (!foundLesson) return next(new HttpError(LESSON_NOT_FOUND_ERROR, 404));

  // Converts the charId's to charChinese's and runs "findCharacter" on the ones that aren't already in the lesson.
  let charIDsInLessonArray = [];
  let charChineseArray = [];
  let foundChar;
  try {
    for (let j = 0; j < foundLesson.characters.length; j++) {
      foundCharInCharactersTable = await Character.findOne({
        where: { charId: foundLesson.characters[j].charId },
      });
      foundCharChinese = foundCharInCharactersTable.charChinese;

      if (charChineseArray.includes(foundCharChinese)) {
        continue;
      } else {
        charChineseArray.push(foundCharChinese);
        try {
          const userProgress = {
            tier: currentTier,
            lessonNumber: currentLesson,
          };

          foundChar = await findCharacter(foundCharChinese, userProgress);

          if (foundChar) {
            charIDsInLessonArray.push(foundChar);
          }
        } catch (err) {
          if (err.code === 401) {
            continue; // Don't include characters the user is not eligible to see.
          } else {
            return next(err);
          }
        }
      }
    }
    // Add the characters to the lesson.
    foundLesson.characters = charIDsInLessonArray;
  } catch (err) {
    console.log(err);
    return next(new HttpError(err, err.code || 500));
  }

  res.json({ foundLesson });
};

const findLessonHelper = async (
  tier,
  currentTier,
  lessonNumber,
  currentLesson,
  requestType
) => {
  // In "Learn" mode, only the characters for the given tier should be shown.
  // In "Review" mode, all characters until (and including) the requested tier are shown.
  let tierOperator;
  if (
    requestType === 'learn' ||
    requestType === 'lesson-select' ||
    requestType === 'admin'
  ) {
    tierOperator = Op.eq;
  } else if (requestType === 'review') {
    tierOperator = Op.lte;
  } else {
    return new HttpError(INVALID_REQUEST_ERROR, 500);
  }

  try {
    let lessonDatabase = await RevampedLesson.findAll();
    if (!lessonDatabase)
      return new HttpError(LESSON_DATABASE_QUERY_FAILED_ERROR, 500);

    let charIdsInGivenLesson = await CharacterOrder.findAll({
      where: {
        tier: { [tierOperator]: tier },
        lessonNumber: { [Op.eq]: lessonNumber },
      },
      include: [Character],
    });

    let status = undefined;
    if (requestType === 'lesson-select') {
      // Adding the tiers (all four) with a status, comparing it with user's progress.
      const userProgress = {
        tier: currentTier,
        lessonNumber: currentLesson,
      };

      status = !charIdsInGivenLesson?.length
        ? LESSON_NOT_IN_TIER
        : { tier, lessonNumber }.comesLaterThan(userProgress)
        ? LESSON_LOCKED
        : lessonDatabase[lessonNumber - 1] &&
          tier === currentTier &&
          lessonNumber === currentLesson
        ? LESSON_UPCOMING
        : LESSON_COMPLETED;
    }
    return {
      tier: tier,
      lessonNumber: lessonNumber,
      name: lessonDatabase[lessonNumber - 1].name,
      preface: lessonDatabase[lessonNumber - 1]['prefaceTier' + tier],
      characters: charIdsInGivenLesson,
      status: status,
    };
  } catch (err) {
    return new HttpError(DATABASE_QUERY_FAILED_ERROR, 500);
  }
};

// An exported function that gets all lessons for the lesson selection screen.
const getLessonSelect = async (req, res, next) => {
  const user = await getUserProgress(req);
  const currentTier = user.tier;
  const currentLesson = user.lessonNumber;
  const displayName = user.displayName;

  let lessonArray = [];
  let currentLessonName;
  try {
    let lessonDatabase = await RevampedLesson.findAll();
    currentLessonName = lessonDatabase.find(
      lesson => lesson.lessonNumber === currentLesson
    ).name;

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
      for (let tier = 1; tier < 5; tier++) {
        let foundLesson = await findLessonHelper(
          tier,
          currentTier,
          lessonNumber,
          currentLesson,
          'lesson-select'
        );
        if (foundLesson) lessonObject.tiers.push(foundLesson);
      }
      // The object created has this approximate shape:
      // { lessonNumber: 1, name: '', tiers: [{tier: 1, preface: prefaceTier1, characters: [{...}, {...}], status: ''}, {tier: 2,...}] }
      lessonArray.push(lessonObject);
    }
  } catch (err) {
    // return next(new HttpError(LESSON_DATABASE_QUERY_FAILED_ERROR, 500));
    return next(new HttpError(err, 500));
  }

  res.json({
    lessonArray,
    user: {
      displayName: displayName,
      currentTier: currentTier,
      currentLesson: currentLesson,
      currentLessonName: currentLessonName,
    },
  });
};

module.exports = {
  getLesson,
  findLessonHelper,
  getLessonSelect,
};
