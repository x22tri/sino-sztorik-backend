const express = require('express');
const { check } = require('express-validator');
const {
  signup,
  login,
  advanceUser,
} = require('../controllers/user-controllers');
const getUserData = require('../util/getUserData');

const router = express.Router();

router.post(
  '/signup',
  [
    check('displayName').not().isEmpty(),
    check('email').not().isEmpty(),
    check('password').isLength({ min: 6 }),
  ],
  signup
);

router.post('/login', login);

router.post('/advance', advanceUser);

router.get('/:userID', getUserData);

module.exports = router;
