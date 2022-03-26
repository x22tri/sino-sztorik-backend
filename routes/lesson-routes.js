const express = require('express')
const lessonControllers = require('../controllers/lesson-controllers')

const router = express.Router()

router.get('/', lessonControllers.getLesson)
router.get('/select', lessonControllers.getLessonSelect)

module.exports = router