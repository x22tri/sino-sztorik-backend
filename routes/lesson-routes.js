const express = require('express');
const {
  getLesson,
  getLessonSelect,
} = require('../controllers/lesson-controllers');

const router = express.Router();

router.get('/', getLesson);
router.get('/select', getLessonSelect);

module.exports = router;
