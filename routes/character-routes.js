const express = require('express');
const { checkIfSearch } = require('../controllers/character-controllers');

const router = express.Router();

router.get('/:charChinese', checkIfSearch);

module.exports = router;
