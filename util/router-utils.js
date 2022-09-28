const { check } = require('express-validator');

const {
  COURSE_FINISHED_TIER,
  COURSE_FINISHED_LESSON_NUMBER,
} = require('./config');

const { getUserProgress } = require('./helper-functions');

const { handleSearch } = require('../controllers/characters/handleSearch');

const signupValidators = [
  check('displayName').not().isEmpty(),
  check('email').not().isEmpty(),
  check('password').isLength({ min: 6 }),
];

async function searchRoute(req, res, next) {
  try {
    const searchTerm = req.params.searchTerm;
    let progress;

    if (req.query.force) {
      progress = {
        tier: COURSE_FINISHED_TIER,
        lessonNumber: COURSE_FINISHED_LESSON_NUMBER,
      };
    } else {
      progress = await getUserProgress(req);
    }

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
