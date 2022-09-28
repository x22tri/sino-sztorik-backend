const { check } = require('express-validator');

const { courseFinishedProgress } = require('./config');

const {
  getUserProgress,
} = require('../controllers/users/utils/getUserProgress');

const { handleSearch } = require('../controllers/characters/handleSearch');

const signupValidators = [
  check('displayName').not().isEmpty(),
  check('email').not().isEmpty(),
  check('password').isLength({ min: 6 }),
];

async function searchRoute(req, res, next) {
  try {
    const searchTerm = req.params.searchTerm;

    const progress = req.query.force
      ? courseFinishedProgress
      : await getUserProgress(req);

    const searchResult = await handleSearch(searchTerm, progress);

    res.json(searchResult);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  signupValidators,
  searchRoute,
};
