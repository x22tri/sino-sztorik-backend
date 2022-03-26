const { Op } = require("sequelize");

const Lesson = require('../models/lessons')
const LessonOrder = require('../models/lesson-orders')
const RevampedLesson = require('../models/revamped-lessons')

const Character = require('../models/characters')
const CharacterOrder = require('../models/character-orders')
const HttpError = require('../models/http-error')

const { findCharacter } = require('./character-controllers')
const { getUserData } = require('./user-controllers')
const { checkEligibilityHelper } = require('../util/helper-functions')

// Setting up relations.
LessonOrder.belongsTo(Lesson, {targetKey: 'lessonId', foreignKey: 'lessonId'});
Lesson.hasOne(LessonOrder, {sourceKey: 'lessonId', foreignKey: 'lessonId'});

// An exported function that gets the lesson corresponding to the requested tier and lessonNumber.
const getLesson = async (req, res, next) => {

    // Getting the current tier and lesson by the currently logged in user.
    let user, currentTier, currentLesson
    try {
        user = await getUserData(req, res, next)
        currentTier = user.currentTier
        currentLesson = user.currentLesson
    } catch (err) {
        return next(new HttpError('Nem sikerült lekérni a felhasználót.', 500))
    }

    // Gets the type of request, i.e. what comes after "api/".
    // Is one of "learn" or "review", or else the request doesn't arrive here.
    let requestType = req.originalUrl.split('/')[2]

    // If the requestType is "learn", the user's own currentLesson property is used.
    // If it is "review", we will get a lesson number passed here.
    let lessonToView
    if (requestType === 'learn') {
      lessonToView = currentLesson
    } else if (requestType === 'review') {
      lessonToView = req.originalUrl.split('/')[3]
    } else {
      return next(new HttpError('Érvénytelen kérés.', 500))
    }

    // Gets the database of lessons in the order that user will see them.
    let orderedLessonDatabase 
    try {
        orderedLessonDatabase = await LessonOrder.findAll({
            where: {lessonNumber: lessonToView},
            include: [Lesson],
            order: [['tier'], ['lessonNumber']]
        })
        if (!orderedLessonDatabase || !orderedLessonDatabase.length) return next (new HttpError('Nincs a keresésnek megfelelő lecke.', 404))
    } catch (err) {
        return next(new HttpError('Nem sikerült lekérni az adatbázist.', 500))
    }
    
    // Finds the first occurrence of this lesson in the database.
    let baseLesson = orderedLessonDatabase[0]
    let baseLessonId = baseLesson.lessonId
    let changedLesson

    // Checks the user's eligibility for the lesson.
    try {
        changedLesson = await JSON.parse(JSON.stringify(baseLesson))

        if (!checkEligibilityHelper(changedLesson.tier, currentTier, changedLesson.lessonNumber, currentLesson)) {
            // There should be validation for this on user end, i.e. this should never come up.
            return next(new HttpError('Még nem láthatod ezt a leckét.', 401))
        }
        else {
            // Loop through all "patchLessons" of the lesson (modifications to its attributes in later tiers),
            // check eligibility and apply changes if eligible.
            for (let i = 1; i < orderedLessonDatabase.length; i++) {
                let patchLesson = orderedLessonDatabase[i].lesson.dataValues
                let patchLessonInOrder = orderedLessonDatabase.find(lesson => lesson.lessonId === patchLesson.lessonId && lesson.tier !== changedLesson.tier).dataValues
                  if (!checkEligibilityHelper(patchLessonInOrder.tier, currentTier, patchLessonInOrder.lessonNumber, currentLesson)) {
                    continue;
                } else {
                    for (const orderProperty in patchLessonInOrder) {
                        // Replacing nested properties.
                        if (orderProperty === 'lesson') {
                            let patchLessonNested = patchLessonInOrder.lesson.dataValues
                            for (const lessonProperty in patchLessonNested) {
                                if (patchLessonNested[lessonProperty] && changedLesson.lesson[lessonProperty] !== patchLessonNested[lessonProperty]) {
                                        changedLesson.lesson[lessonProperty] = patchLessonNested[lessonProperty]
                                }
                            }
                        // Replacing non-nested properties.
                        } else {
                            changedLesson[orderProperty] = patchLessonInOrder[orderProperty]
                        }
                    }
                }
            }
            // Renaming properties for clarity's sake.
            changedLesson.baseLessonId = baseLessonId
            changedLesson.lessonId = undefined
            changedLesson.latestPatchLessonId = changedLesson.lesson.lessonId
            changedLesson.lesson.lessonId = undefined
        } 
    } catch (err) {
        return next(new HttpError('Nem sikerült lekérni az adatbázist.', 500))
    }

    // Looks through the "characterorders" array, finds all the "charId"'s associated with the requested lesson.
    let charIDsInLesson
    try {
        // In "Learn" mode, only the characters for the given tier should be shown.
        // In "Review" mode, all characters until (and including) the requested tier are shown.
        let tierOperator
        if (requestType === 'learn') {
          tierOperator = Op.eq
        } else if (requestType === 'review') {
          tierOperator = Op.lte
        }

        charIDsInLesson = await CharacterOrder.findAll({
          where: {
              tier: {[tierOperator]: currentTier},
              lessonNumber: {[Op.eq]: lessonToView}
              },
          order: ['indexInLesson'],
          attributes: ['charId']
        })
        if (!charIDsInLesson) return new HttpError('A kért leckében nincs karakter.', 404)
    } catch (err) {
        return next(new HttpError('Nem sikerült lekérni a lecke karaktereit.', 500))
    }

    // Converts the charId's to charChinese's and runs "findCharacter" on the ones that aren't already in the lesson.
    let charIDsInLessonArray = []
    let charChineseArray = []
    let foundChar
    try {
        for (let j = 0; j < charIDsInLesson.length; j++) {
            foundCharInCharactersTable = await Character.findOne({where: {charId: charIDsInLesson[j].charId}})
            foundCharChinese = foundCharInCharactersTable.charChinese
            
            if (charChineseArray.includes(foundCharChinese)) {
                continue;
            } else {
                charChineseArray.push(foundCharChinese)
                foundChar = await findCharacter(currentTier, currentLesson, foundCharChinese, true)
                if (foundChar && !foundChar.code) charIDsInLessonArray.push(foundChar)
                else return next(foundChar) // If there was an error, throw it.
            }
        }
        // Add the characters to the lesson.
        changedLesson.characters = charIDsInLessonArray
    } catch (err) {
        return next(new HttpError(err, 500))
    }
    
    res.json({changedLesson})
}

// A function used here (in lesson-controllers) and in admin-controllers to get all lessons
// (with slightly different data to be displayed depending on whether it's called with the "admin" flag.)
const findAllLessonsHelper = async (admin = false) => {
  
    // Finds all entries in the lesson-orders database.
    let lessonOrderDatabase
    try {
      lessonOrderDatabase = await LessonOrder.findAll({
        include: [Lesson],
        order: [['lessonNumber'], ['tier']],
      })
      if (!lessonOrderDatabase)
        return next(new HttpError('Nincs lecke az adatbázisban.', 404))
    } catch (err) {
      return next(new HttpError('Nem sikerült lekérni az adatbázist.', 500))
    }
  
    // Makes an array out of all (unique) lessonNumbers in the database.
    let allLessonNumbers
    try {
      allLessonNumbers = await lessonOrderDatabase
        .map((lesson) => lesson.lessonNumber)
        .filter((value, index, self) => self.indexOf(value) === index)
    } catch (err) {
      return next(new HttpError('Hiba a leckeszámok lekérése közben.', 500))
    }
  
    // Sorts the different "versions" of a given lesson into an array.
    let tieredLessonArray = []
    let allTiersOfLessonInDatabase
    try {
      for (let i = 0; i < allLessonNumbers.length; i++) {
        let currentLesson = allLessonNumbers[i]
  
        allTiersOfLessonInDatabase = await LessonOrder.findAll({
          where: { lessonNumber: currentLesson },
          include: {
            model: Lesson,
            attributes: {
              exclude: !admin && ['preface']
            }
          },
          order: [['lessonNumber'], ['tier']]
        })
        if (!allTiersOfLessonInDatabase) return next(new HttpError('Nincs lecke az adatbázisban.', 404))
  
        // Gets the characters in each lesson.
        // The model instance has to be reconverted into JSON to add a new property to it.
        let lessonTiersJSON = await JSON.parse(JSON.stringify(allTiersOfLessonInDatabase))
        let charIdsInGivenLesson
        for (let j = 0; j < lessonTiersJSON.length; j++) {
          charIdsInGivenLesson = await CharacterOrder.findAll({
            where: { tier: lessonTiersJSON[j].tier, lessonNumber: lessonTiersJSON[j].lessonNumber },
            include: admin && [Character]
          })
          if (charIdsInGivenLesson && charIdsInGivenLesson.length) {
            lessonTiersJSON[j].characters = charIdsInGivenLesson
          }
        }
  
        tieredLessonArray.push({
          lessonNumber: currentLesson,
          versions: lessonTiersJSON,
        })
      }
    } catch (err) {
      return next(new HttpError('Nem sikerült lekérni az adatbázist.', 500))
    }
  
    return tieredLessonArray
  }

// An exported function that gets all lessons for the lesson selection screen.
const getLessonSelect = async (req, res, next) => {

    let tieredLessonArray
    try {
        tieredLessonArray = await findAllLessonsHelper()
    } catch (err) {
        return next(new HttpError('Nem sikerült lekérni a leckéket.', 500))
    }

    // Getting the current tier and lesson by the currently logged in user.
    let user, currentTier, currentLesson, displayName
    try {
        user = await getUserData(req, res, next)
        if (user) {
        currentTier = user.currentTier
        currentLesson = user.currentLesson
        displayName = user.displayName
        } else {
          return next(new HttpError('Nem sikerült lekérni a felhasználót.', 500))
        }
    } catch (err) {
        return next(new HttpError('Nem sikerült lekérni a felhasználót.', 500))
    }
    
    let currentLessonName
    try {
      for (let i = 0; i < tieredLessonArray.length; i++) {
        let lessonToAnalyze = tieredLessonArray[i]
        let lessonTierArray = []
        for (let tierToAnalyze = 1; tierToAnalyze < 5; tierToAnalyze++) {
          if (!lessonToAnalyze.versions.find(version => version.tier === tierToAnalyze)) {
            lessonTierArray.push({tier: tierToAnalyze, status: 'Ebben a körben nincs ilyen lecke'})
            continue;
          } else {
            let lessonVersionToAnalyze = JSON.parse(JSON.stringify(lessonToAnalyze.versions.find(version => version.tier === tierToAnalyze)))

            // Getting the first version of the name, and then the latest one user is eligible to see.
            if (lessonVersionToAnalyze.lesson.name) {
              if (!lessonToAnalyze.lessonName) {
                lessonToAnalyze.lessonName = lessonVersionToAnalyze.lesson.name
              } 
              else if (checkEligibilityHelper(tierToAnalyze, currentTier, lessonVersionToAnalyze.lessonNumber, currentLesson)) {
                lessonToAnalyze.lessonName = lessonVersionToAnalyze.lesson.name
              }
            }

            // Adding the tiers with status.
            // All four tiers are given a status - if the lesson doesn't exist for that tier, it gets a "No lesson in this tier" status up above.
            if (!checkEligibilityHelper(tierToAnalyze, currentTier, lessonVersionToAnalyze.lessonNumber, currentLesson)) {
              lessonTierArray.push({tier: tierToAnalyze, status: 'Még nincs feloldva'})  
            } else if (lessonVersionToAnalyze && tierToAnalyze === currentTier && lessonVersionToAnalyze.lessonNumber === currentLesson) {
              lessonTierArray.push({tier: tierToAnalyze, status: 'Soron következő lecke'})
              currentLessonName = lessonVersionToAnalyze.lesson.name
            } else {
              lessonTierArray.push({tier: tierToAnalyze, status: 'Már megtanult lecke'})
            }
        }
      }
        lessonToAnalyze.versions = lessonTierArray
      }

      res.json({tieredLessonArray, user: {
        displayName: displayName, 
        currentTier: currentTier, 
        currentLesson: currentLesson, 
        currentLessonName: currentLessonName}
      })
  } catch (err) {
      return next(new HttpError('Nem sikerült lekérni a leckéket.', 500))
  }
}

exports.getLesson = getLesson
exports.findAllLessonsHelper = findAllLessonsHelper
exports.getLessonSelect = getLessonSelect