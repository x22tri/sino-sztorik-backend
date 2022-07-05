const { Op } = require('sequelize')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const getUserData = require('../util/getUserData')

const User = require('../models/users')
const CharacterOrder = require('../models/character-orders')
const HttpError = require('../models/http-error')

const saltRounds = 12

const signup = async (req, res, next) => {
  if (!validationResult(req).isEmpty()) {
    return next(new HttpError('A megadott adatok érvénytelenek.', 422))
  }

  const { displayName, email, password } = req.body

  try {
    const existingUser = await User.findOne({ where: { email: email } })
    if (existingUser)
      return next(
        new HttpError(
          'Ez az e-mail-cím már foglalt. Kérjük, regisztrálj másikkal.',
          422
        )
      )

    let hashedPassword, createdUser
    try {
      hashedPassword = await bcrypt.hash(password, saltRounds)
      createdUser = await User.create({
        //userId is autoIncrementing, created automatically by Sequelize
        displayName,
        email,
        password: hashedPassword,
        currentTier: 1,
        currentLesson: 1,
      })
    } catch (err) {
      return next(
        new HttpError(
          'Nem sikerült létrehozni a felhasználói fiókod. Kérjük, próbálkozz később.',
          500
        )
      )
    }

    let token
    token = jwt.sign({ userId: createdUser.userId }, process.env.JWT_KEY)

    res.status(201).json({ userId: createdUser.userId, token: token })
  } catch (err) {
    return next(new HttpError(err, 500))
  }
}

const login = async (req, res, next) => {
  const { email, password } = req.body

  try {
    const identifiedUser = await User.findOne({ where: { email: email } })
    if (!identifiedUser) {
      return next(new HttpError('Téves e-mail-cím vagy jelszó.', 401))
    }

    let isValidPassword = false
    try {
      isValidPassword = await bcrypt.compare(password, identifiedUser.password)
    } catch (err) {
      return next(
        new HttpError(
          'Nem sikerült a bejelentkezés. Kérjük, próbálkozz később.',
          500
        )
      )
    }

    if (!isValidPassword) {
      return next(new HttpError('Téves e-mail-cím vagy jelszó.', 401))
    }

    let token
    token = jwt.sign({ userId: identifiedUser.userId }, process.env.JWT_KEY)

    res.status(200).json({ userId: identifiedUser.userId, token: token })
  } catch (err) {
    return next(new HttpError(err, 500))
  }
}

const advanceUser = async (req, res, next) => {
  let user, currentTier, currentLesson

  try {
    user = await getUserData(req, res, next)
    currentTier = user.currentTier
    currentLesson = user.currentLesson
  } catch (err) {
    return next(new HttpError('Nem sikerült lekérni a felhasználót.', 500))
  }

  let foundLessonToAdvanceTo = false
  try {
    // Go to the next lessonNumber in the same tier if applicable.
    let remainingLessonsInTier = await CharacterOrder.findAll({
      where: { tier: currentTier, lessonNumber: { [Op.gt]: currentLesson } },
      order: ['lessonNumber'],
    })

    // console.log(remainingLessonsInTier)

    if (remainingLessonsInTier && remainingLessonsInTier.length) {
      foundLessonToAdvanceTo = true

      await user.update({
        currentLesson: remainingLessonsInTier[0].lessonNumber,
      })

      res.json(
        `Sikeres frissítés! Az új állapot: ${currentTier}. kör, ${remainingLessonsInTier[0].lessonNumber}. lecke.`
      )
    } else {
      let lessonsInNextTier = await CharacterOrder.findAll({
        where: { tier: currentTier + 1 },
        order: ['lessonNumber'],
      })

      if (lessonsInNextTier && lessonsInNextTier.length) {
        foundLessonToAdvanceTo = true

        await user.update({
          currentTier: lessonsInNextTier[0].tier,
          currentLesson: lessonsInNextTier[0].lessonNumber,
        })

        res.json(
          `Sikeres frissítés! Az új állapot: ${lessonsInNextTier[0].tier}. kör, ${lessonsInNextTier[0].lessonNumber}. lecke.`
        )
      } else if (currentTier === 4) {
        // There are 4 tiers in the course.
        // If the user completes all tiers and all lessons, they get to an out-of-bounds special tier so they can view all characters.
        const finalTier = 5
        const finalLessonNumber = 100
        foundLessonToAdvanceTo = true

        await user.update({
          currentTier: finalTier,
          currentLesson: finalLessonNumber,
        })

        res.json(`Befejezted a kurzust. Minden karakter feloldva.`)
      }
    }

    if (!foundLessonToAdvanceTo) {
      res.json(`A soron következő lecke nem található.`)
    }
  } catch (err) {
    return next(
      new HttpError(
        `Nem sikerült frissíteni az előrehaladásod. Hibaüzenet: ${err}`,
        500
      )
    )
  }
}

exports.signup = signup
exports.login = login
exports.advanceUser = advanceUser
