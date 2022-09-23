const express = require('express');
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

const router = express.Router();

router.get('/all-lessons', getAllLessons);
router.get('/additional-info/:charId', getAdditionalInfoAdmin);
router.put('/lesson/update/:lessonId', updateLesson);

router.get('/all-phrases', getAllPhrases);
router.put('/all-phrases/update', updateAllPhrasesOrOtherUses);
router.get('/all-other-uses', getAllOtherUses);
router.put('/all-other-uses/update', updateAllPhrasesOrOtherUses);
router.get('/all-similars/:similarType', getAllSimilars);
router.put('/character/:charId/update', updateCharacter);

module.exports = router;
