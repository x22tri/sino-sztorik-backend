const {
  signup,
  login,
  advanceUser,
} = require('../controllers/user-controllers');

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

const { getUser } = require('../controllers/users/utils/getUser');

const {
  COURSE_FINISHED_TIER,
  COURSE_FINISHED_LESSON_NUMBER,
} = require('./config');

const { signupValidators, searchRoute } = require('./router-utils');

const express = require('express');
const router = express.Router();

// Routes start here.
router.post('/api/users/signup', signupValidators, signup);

router.post('/api/users/login', login);
router.post('/api/users/advance', advanceUser);
router.get('/api/users/:userID', (req, res, next) => {
  getUser(req.headers.authorization);
});

router.get('/api/learn', getLesson);
router.get('/api/learn/select', getLessonSelect);
router.get('/api/review/:charID', getLesson);

router.get('/api/search/:searchTerm', searchRoute);

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
