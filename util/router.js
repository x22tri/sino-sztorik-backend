const { check } = require('express-validator');

const {
  signup,
  login,
  advanceUser,
} = require('../controllers/user-controllers');

const { checkIfSearch } = require('../controllers/character-controllers');

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

const getUserData = require('./getUserData');

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

router.get('/api/char/:charChinese', checkIfSearch);
router.get('/api/search/:charChinese', checkIfSearch);
router.get('/api/force-search/:charChinese', checkIfSearch);

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
