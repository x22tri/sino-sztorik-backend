const express = require('express')
const characterControllers = require('../controllers/character-controllers')

const router = express.Router()

router.get('/:charChinese', characterControllers.checkIfSearch)

module.exports = router