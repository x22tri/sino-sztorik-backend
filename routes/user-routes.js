const express = require('express')
const { check } = require('express-validator')
const userControllers = require('../controllers/user-controllers')

const router = express.Router()

router.post(
    '/signup', 
    [check('displayName').not().isEmpty(), 
    check('email').not().isEmpty(), 
    check('password').isLength({min: 6}), 
    ],
    userControllers.signup)

router.post('/login', userControllers.login)

router.post('/advance', userControllers.advanceUser)

router.get('/:userID', userControllers.getUserData)

module.exports = router