const express = require('express')
const { check } = require('express-validator')
const userControllers = require('../controllers/user-controllers')
const getUserData = require('../util/getUserData')

const router = express.Router()

router.post(
  '/signup',
  [
    check('displayName').not().isEmpty(),
    check('email').not().isEmpty(),
    check('password').isLength({ min: 6 }),
  ],
  userControllers.signup
)

router.post('/login', userControllers.login)

router.post('/advance', userControllers.advanceUser)

router.get('/:userID', getUserData)

module.exports = router
