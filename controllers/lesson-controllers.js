const { Op } = require("sequelize");
const RevampedLesson = require('../models/revamped-lessons')

const Character = require('../models/characters')
const CharacterOrder = require('../models/character-orders')
const HttpError = require('../models/http-error')

const { findCharacter } = require('./character-controllers')
const { getUserData } = require('./user-controllers')
const { checkEligibilityHelper } = require('../util/helper-functions')

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

    let foundLesson = await findLessonHelper(currentTier, currentTier, lessonToView, currentLesson, requestType)
    if (!foundLesson) return next(new HttpError('A lecke nem található.', 404))

    // Converts the charId's to charChinese's and runs "findCharacter" on the ones that aren't already in the lesson.
    let charIDsInLessonArray = []
    let charChineseArray = []
    let foundChar
    try {
        for (let j = 0; j < foundLesson.characters.length; j++) {
            foundCharInCharactersTable = await Character.findOne({where: {charId: foundLesson.characters[j].charId}})
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
        foundLesson.characters = charIDsInLessonArray
    } catch (err) {
        return next(new HttpError(err, 500))
    }

    res.json({foundLesson})
}

const findLessonHelper = async (tier, currentTier, lessonNumber, currentLesson, requestType) => {
  // In "Learn" mode, only the characters for the given tier should be shown.
  // In "Review" mode, all characters until (and including) the requested tier are shown.
  let tierOperator
  if (requestType === 'learn' || requestType === 'lesson-select' || requestType === 'admin') {
    tierOperator = Op.eq
  } else if (requestType === 'review') {
    tierOperator = Op.lte
  } else {
    return new HttpError('Érvénytelen kérés.', 500)
  }

  try {
    let lessonDatabase = await RevampedLesson.findAll()
    if (!lessonDatabase) return new HttpError('Nem sikerült lekérni a leckéket.', 500)

    let charIdsInGivenLesson = await CharacterOrder.findAll({
      where: {tier: {[tierOperator]: tier}, lessonNumber: {[Op.eq]: lessonNumber}},
      include: [Character]}) 
    //   // include: [Character]

    let status = undefined
    if (requestType === 'lesson-select') {
      if (charIdsInGivenLesson && charIdsInGivenLesson.length) {
          // Adding the tiers (all four) with a status, comparing it with user's progress.
          if (!checkEligibilityHelper(tier, currentTier, lessonNumber, currentLesson)) {
            status = 'Még nincs feloldva'
          } else if (lessonDatabase[lessonNumber - 1] && tier === currentTier && lessonNumber === currentLesson) {
            status = 'Soron következő lecke'
          } else {
            status = 'Már megtanult lecke'
          }
      } else {
        status = 'Ebben a körben nincs ilyen lecke'
      }
    }
    return {tier: tier, lessonNumber: lessonNumber, name: lessonDatabase[lessonNumber - 1].name, 
      preface: lessonDatabase[lessonNumber - 1]['prefaceTier' + tier], characters: charIdsInGivenLesson, status: status}
  } catch (err) {
    return new HttpError('Nem sikerült lekérni az adatbázist.', 500)
  }
}

// An exported function that gets all lessons for the lesson selection screen.
const getLessonSelect = async (req, res, next) => { 

    // Getting the current tier and lesson by the currently logged in user.
    let user, currentTier, currentLesson, displayName
    try {
        user = await getUserData(req, res, next)
        if (user) {
        currentTier = user.currentTier
        currentLesson = user.currentLesson
        displayName = user.displayName
        } else {
          return next(new HttpError('A felhasználó nem található.', 404))
        }
    } catch (err) {
        return next(new HttpError('Nem sikerült lekérni a felhasználót.', 500))
    }

    let lessonArray = []
    let currentLessonName
    try {
      let lessonDatabase = await RevampedLesson.findAll()
      currentLessonName = lessonDatabase.find(lesson => lesson.lessonNumber === currentLesson).name

      // Iterates over all lessonNumbers and tiers to get all lessons.
      for (let lessonNumber = 1; lessonNumber < (lessonDatabase.length + 1); lessonNumber++) {
        let lessonObject = {lessonNumber: lessonNumber, name: lessonDatabase[lessonNumber - 1].name, tiers: []}
        for (let tier = 1; tier < 5; tier++) {
          let foundLesson = await findLessonHelper(tier, currentTier, lessonNumber, currentLesson, 'lesson-select')
          if (foundLesson) lessonObject.tiers.push(foundLesson)
        }
        // The object created has this approximate shape:
        // { lessonNumber: 1, name: '', tiers: [{tier: 1, preface: prefaceTier1, characters: [{...}, {...}], status: ''}, {tier: 2,...}] }
        lessonArray.push(lessonObject)
      }
    } catch (err) {
      return next(new HttpError('Nem sikerült lekérni a leckéket.', 500))
    }

      res.json({lessonArray, user: {
        displayName: displayName, 
        currentTier: currentTier, 
        currentLesson: currentLesson, 
        currentLessonName: currentLessonName}
      })
}

exports.getLesson = getLesson
exports.findLessonHelper = findLessonHelper
exports.getLessonSelect = getLessonSelect