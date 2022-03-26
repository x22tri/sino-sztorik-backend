const express = require('express')
const adminControllers = require('../controllers/admin-controllers')

const router = express.Router()

router.get('/all-lessons', adminControllers.getAllLessons)
router.get('/additional-info/:charId', adminControllers.getAdditionalInfoAdmin)
router.put('/lesson/update/:lessonId', adminControllers.updateLesson)

router.get('/all-phrases', adminControllers.getAllPhrases)
router.put('/all-phrases/update', adminControllers.updateAllPhrasesOrOtherUses)
router.get('/all-other-uses', adminControllers.getAllOtherUses)
router.put('/all-other-uses/update', adminControllers.updateAllPhrasesOrOtherUses)
router.get('/all-similars/:similarType', adminControllers.getAllSimilars)
router.put('/character/:charId/update', adminControllers.updateCharacter)


module.exports = router
