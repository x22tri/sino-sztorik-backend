const { check } = require('express-validator');

const {
  signup,
  login,
  advanceUser,
} = require('../controllers/user-controllers');

const {
  handleSearch,
  findCharacter,
} = require('../controllers/character-controllers');

const {
  getLesson,
  getLessonSelect,
} = require('../controllers/lesson-controllers');

const {
  getAllLessons,
  getAdditionalInfoAdmin,
  updateLesson,
  getAllPhrases,
  updateAllPhrasesOrOtherUses,
  getAllOtherUses,
  getAllSimilars,
  updateCharacter,
} = require('../controllers/admin-controllers');

const { getUserData, authenticate } = require('./getUserData');

const {
  COURSE_FINISHED_TIER,
  COURSE_FINISHED_LESSON_NUMBER,
} = require('./config');

const express = require('express');
const router = express.Router();

// Routes start here.
router.post(
  '/api/users/signup',
  [
    check('displayName').not().isEmpty(),
    check('email').not().isEmpty(),
    check('password').isLength({ min: 6 }),
  ],
  signup
);

router.post('/api/users/login', login);
router.post('/api/users/advance', advanceUser);
router.get('/api/users/:userID', getUserData);

router.get('/api/learn', getLesson);
router.get('/api/learn/select', getLessonSelect);
router.get('/api/review/:charID', getLesson);

// This might not be needed at all. I can't find who calls it. Please test without it.
// router.get('/api/char/:charChinese', async (req, res, next) => {
//   try {
//     const searchTerm = req.params.searchTerm;
//     const authHeader = req.headers.authorization;
//     const { currentTier, currentLesson } = await authenticate(authHeader);
//     const userProgress = { tier: currentTier, lessonNumber: currentLesson };
//     const searchResult = await findCharacter(
//       currentTier,
//       currentLesson,
//       searchTerm,
//       true
//     );
//     res.json(searchResult);
//   } catch (err) {
//     next(err);
//   }
// });

router.get('/api/force-search/:searchTerm', async (req, res, next) => {
  try {
    const searchTerm = req.params.searchTerm;
    const searchResult = await handleSearch(searchTerm, {
      tier: COURSE_FINISHED_TIER,
      lessonNumber: COURSE_FINISHED_LESSON_NUMBER,
    });
    res.json(searchResult);
  } catch (err) {
    next(err);
  }
});

router.get('/api/search/:searchTerm', async (req, res, next) => {
  try {
    const searchTerm = req.params.searchTerm;
    const authHeader = req.headers.authorization;
    const { currentTier, currentLesson } = await authenticate(authHeader);
    const userProgress = { tier: currentTier, lessonNumber: currentLesson };
    const searchResult = await handleSearch(searchTerm, userProgress);
    res.json(searchResult);
  } catch (err) {
    next(err);
  }
});

router.get('/api/admin/all-lessons', getAllLessons);
router.get('/api/admin/additional-info/:charId', getAdditionalInfoAdmin);
router.put('/api/admin/lesson/update/:lessonId', updateLesson);

router.get('/api/admin/all-phrases', getAllPhrases);
router.put('/api/admin/all-phrases/update', updateAllPhrasesOrOtherUses);
router.get('/api/admin/all-other-uses', getAllOtherUses);
router.put('/api/admin/all-other-uses/update', updateAllPhrasesOrOtherUses);
router.get('/api/admin/all-similars/:similarType', getAllSimilars);
router.put('/api/admin/character/:charId/update', updateCharacter);

module.exports = router;
