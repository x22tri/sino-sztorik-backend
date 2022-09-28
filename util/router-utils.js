const { check } = require('express-validator');

const signupValidators = [
  check('displayName').not().isEmpty(),
  check('email').not().isEmpty(),
  check('password').isLength({ min: 6 }),
];

module.exports = {
  signupValidators,
};
