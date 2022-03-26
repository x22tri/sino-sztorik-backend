const { Op } = require("sequelize");

const Character = require('../models/characters')
const CharacterOrder = require('../models/character-orders')
const Similar = require('../models/similars')
const Phrase = require('../models/phrases')
const OtherUse = require('../models/other-uses')
const HttpError = require('../models/http-error');

const { getUserData } = require('./user-controllers')
const { checkEligibilityHelper } = require('../util/helper-functions')

// Setting up relations.
CharacterOrder.belongsTo(Character, {foreignKey : 'charId'});
Character.hasOne(CharacterOrder, {foreignKey : 'charId'});

const findCharacter = async (currentTier, currentLesson, requestedChar, additionalInfo = false) => {

    if (isNaN(currentTier) || isNaN(currentLesson)) {
        return new HttpError('Érvénytelen értékek megadva. A körnek és a leckének számértéknek kell lenniük.', 404)
    }
    
    // Looks through the "characters" array, finds all the "charId"'s associated with the requested character.
    let currentCharEntries
    let currentCharEntriesArray = []
    try {
        currentCharEntries = await Character.findAll({where: {charChinese: requestedChar}, attributes: ['charId'] })
        if (!currentCharEntries || !currentCharEntries.length) return new HttpError('A karakter nem található.', 404)
        currentCharEntriesArray = currentCharEntries.map(entry => entry.charId)
    } catch (err) {
        return new HttpError('Nem sikerült lekérni a karaktert.', 500)
    }

    // Gets the chars of these charId's from the database in the order that user will see it.
    let orderedCharacterDatabase 
    try {
        orderedCharacterDatabase = await CharacterOrder.findAll({
            where: {charId: currentCharEntriesArray},
            include: [Character],
            order: [['tier'], ['lessonNumber'], ['indexInLesson']]
        })
        if (!orderedCharacterDatabase || !orderedCharacterDatabase.length) return new HttpError('Nincs a keresésnek megfelelő elem.', 404)
    } catch (err) {
        return new HttpError('Nem sikerült lekérni az adatbázist.', 500)
    }

    // Checks the user's eligibility for the character.
    let changedChar
    try {
        // Finds the first occurrence of this character in the database and designates it as the "baseChar".
        let baseChar = orderedCharacterDatabase[0]
        
        changedChar = await JSON.parse(JSON.stringify(baseChar))

        if (!checkEligibilityHelper(baseChar.tier, currentTier, baseChar.lessonNumber, currentLesson)) {
            return new HttpError('Még nem láthatod ezt a karaktert.', 401)
        } else {
            // Loop through all "patchChars" of the character (modifications to its attributes in later lessons),
            // check eligibility and apply changes if eligible.
            for (let i = 1; i < orderedCharacterDatabase.length; i++) {
            
                let patchChar = orderedCharacterDatabase[i].character.dataValues
                let patchCharInOrder = await orderedCharacterDatabase.find(char => char.charId === patchChar.charId).dataValues

                if (!checkEligibilityHelper(patchCharInOrder.tier, currentTier, patchCharInOrder.lessonNumber, currentLesson)) {
                    continue;
                } else {
                    // Set the "reminder" property on the character.
                    if (orderedCharacterDatabase[i].dataValues.charId === baseChar.charId && checkEligibilityHelper(
                            orderedCharacterDatabase[i].dataValues.tier,
                            currentTier, 
                            orderedCharacterDatabase[i].dataValues.lessonNumber, 
                            currentLesson
                        )) {
                        changedChar.reminder = true
                        }
                        
                    for (const orderProperty in patchCharInOrder) {
                        // Replacing nested properties.
                        if (orderProperty === 'character') {
                            let patchCharNested = patchCharInOrder.character.dataValues
                            for (const characterProperty in patchCharNested) {
                                if (patchCharNested[characterProperty] && changedChar.character[characterProperty] !== patchCharNested[characterProperty]) {
                                    // Set the "newPrimitive" property on the character if the primitiveMeaning was newly added.
                                    if (characterProperty === 'primitiveMeaning') changedChar.newPrimitive = true

                                    changedChar.character[characterProperty] = patchCharNested[characterProperty]
                                }
                            }
                        // Replacing non-nested properties.
                        } else {
                            changedChar[orderProperty] = patchCharInOrder[orderProperty]
                        }
                    }
                }
            }
            // Renaming properties for clarity's sake.
            changedChar.baseCharId = baseChar.charId
            changedChar.charId = undefined
            changedChar.latestPatchCharId = changedChar.character.charId
            changedChar.character.charId = undefined
        } 
    } catch (err) {
        return new HttpError('Nem sikerült lekérni az adatbázist.', 500)
    }

    let charWithAdditionalInfo
    if (additionalInfo) {
        charWithAdditionalInfo = await findAdditionalInfo(currentTier, currentLesson, changedChar)
        return charWithAdditionalInfo
    } else {
        return changedChar
    }
}

const findAdditionalInfo = async (currentTier, currentLesson, requestedChar, admin = false) => {

    // let additionalInfoObject
    let objectToAddInfoTo = admin ? {} : requestedChar

    // Find similar characters.
    let foundCharInSimilar 
    let similarToChar
    let foundSimilarChar
    let similarAppearanceArray = []
    let similarMeaningArray = []

    try {
        foundCharInSimilar = await Similar.findOne({
            where: {charChinese: requestedChar.character.charChinese}
        })
        if (foundCharInSimilar) {
            // Find all other characters in the same "similarGroup" as the requested character.
            similarToChar = await Similar.findAll({
                where: 
                {[Op.and]: [
                    {similarGroup: foundCharInSimilar.similarGroup}, 
                    {[Op.not]: [{charChinese: foundCharInSimilar.charChinese}]}
                ]}
            })
        }
        if (similarToChar) {
            for (let i = 0; i < similarToChar.length; i++) {
                try {
                    // No eligibility checks needed if the function is called with "admin".
                    if (admin) {
                        foundSimilarChar = similarToChar[i].charChinese
                    } else {
                        foundSimilarChar = await findCharacter(currentTier, currentLesson, similarToChar[i].charChinese, false)
                        if (!foundSimilarChar || foundSimilarChar.code || !checkEligibilityHelper(
                            foundSimilarChar.tier, 
                            requestedChar.tier, 
                            foundSimilarChar.lessonNumber, 
                            requestedChar.lessonNumber,
                            foundSimilarChar.indexInLesson, 
                            requestedChar.indexInLesson
                        )) {
                        continue;
                     } 
                 }
                    if (similarToChar[i].similarType === 'appearance') {
                        similarAppearanceArray.push(foundSimilarChar)
                    }
                    if (similarToChar[i].similarType === 'meaning') {
                        if (similarToChar[i].similarToPrimitiveMeaning) {
                            foundSimilarChar.similarToPrimitiveMeaning = true
                        }
                        similarMeaningArray.push(foundSimilarChar)
                    }
                } catch (err) {
                    continue;
                }
            }
        }
    } catch (err) {
        return new HttpError('Nem sikerült lekérni a hasonló karaktereket.', 500)
    }
    objectToAddInfoTo.similarAppearance = similarAppearanceArray
    objectToAddInfoTo.similarMeaning = similarMeaningArray

    // Find phrases with the character.
    let foundCharInPhrases
    let foundPhraseCharArray = []
    try {
        foundCharInPhrases = await Phrase.findAll({
            where: {phraseChinese: 
                {[Op.like]: `%${requestedChar.character.charChinese}%`}
            }
        })
        // Go through each character in each phrase.
        // If user is not eligible for at least one of the characters, don't show the phrase altogether.
        if (foundCharInPhrases) {
            if (admin) {
                // No eligibility checks or character breakdown needed if the function is called with "admin".
                foundPhraseCharArray = foundCharInPhrases
            } else {
            for (let i = 0; i < foundCharInPhrases.length; i++) {
                let allCharsInGivenPhrase = []
                for (let j = 0; j < foundCharInPhrases[i].phraseChinese.length; j++) {
                    try {
                        let charInGivenPhrase
                            charInGivenPhrase = await findCharacter(currentTier, currentLesson, foundCharInPhrases[i].phraseChinese.charAt(j), false)
                            if (!charInGivenPhrase || charInGivenPhrase.code || !checkEligibilityHelper(
                                charInGivenPhrase.tier, 
                                requestedChar.tier, 
                                charInGivenPhrase.lessonNumber, 
                                requestedChar.lessonNumber,
                                charInGivenPhrase.indexInLesson, 
                                requestedChar.indexInLesson
                                )) {
                                continue;
                            }
                            allCharsInGivenPhrase.push(charInGivenPhrase)
                            
                            if (allCharsInGivenPhrase.length === foundCharInPhrases[i].phraseChinese.length) {
                                foundCharInPhrases[i].dataValues.characters = allCharsInGivenPhrase
                                foundPhraseCharArray.push(foundCharInPhrases[i])
                            }
                        } catch (err) {
                            continue
                        }
                    }
                }
            }
        }
    } catch (err) {
        return new HttpError('Nem sikerült lekérni a karaktert tartalmazó kifejezéseket.', 500)
    }
    objectToAddInfoTo.phrases = foundPhraseCharArray

    // Finds the other uses of the character.
    let foundCharInOtherUses
    try {
        foundCharInOtherUses = await OtherUse.findAll({
            where: {charChinese: requestedChar.character.charChinese},
            order: ['pinyin'],
            // Sort by pinyin (accent-sensitive).
            attributes: ['pinyin', 'otherUseHungarian']
        })
        // Removes duplicate pinyins.
        if (foundCharInOtherUses && foundCharInOtherUses.length > 1) {
            let previousDifferentPinyin = foundCharInOtherUses[0].pinyin
            for (let i = 1; i < foundCharInOtherUses.length; i++) {
                if (foundCharInOtherUses[i].pinyin !== previousDifferentPinyin) {
                    previousDifferentPinyin = foundCharInOtherUses[i].pinyin
                } else {
                    foundCharInOtherUses[i].pinyin = undefined
                }
            }
        }
    } catch (err) {
        return new HttpError('Nem sikerült lekérni a karakter egyéb jelentéseit.', 500)
    }
    objectToAddInfoTo.otherUses = foundCharInOtherUses

    // Generates a constituent list for the character (if not present already) based on its story.
    // Constituents are in the format {charChinese|text to display}.
    // For the admin interface, this is generated on the fly as the story can be changed, so it will not be sent from here.
    if (!requestedChar.character.constituents || !requestedChar.character.constituents.length && !admin) {
        try {
            let collectedConstituentsArray = []
            collectedConstituentsArray = requestedChar.character.story
            .split(/[{}]/)
            .filter(substring => substring.includes('|'))
            .filter(bracesElement => bracesElement.split('|')[0] !== 'p' && bracesElement.split('|')[0] !== 'k')
            .map(substring => substring.split('|')[0])
            .filter((item, pos, self) => self.indexOf(item) === pos)

            requestedChar.character.constituents = collectedConstituentsArray
        } catch (err) {
            return new HttpError('Nem sikerült lekérni a karakter alkotóelemeit.', 500)
        }
    } else {
        // If the character does have its "constituents" field populated (in CSV), convert it to an array.
        try {
            requestedChar.character.constituents = requestedChar.character.constituents.split(',')
        } catch (err) {
            return new HttpError('Nem sikerült lekérni a karakter alkotóelemeit.', 500)
        }
    }

    // Finds the character entries for the given charChineses.
    if (requestedChar.character.constituents && requestedChar.character.constituents.length && !admin) {
        try {
            let foundConstituentsInCharacterArray = []
            for (let i = 0; i < requestedChar.character.constituents.length; i++) {
                let currentConstituent
                currentConstituent = await findCharacter(currentTier, currentLesson, requestedChar.character.constituents[i], false)
                if (currentConstituent) {
                    foundConstituentsInCharacterArray.push(currentConstituent)
                }
                // Note: if the constituent can't be found, a {code: 404} will be pushed into the array.
                // This should be handled on the frontend.
                // It should be kept in as it points out the gaps in the database.
            }
            requestedChar.character.constituents = foundConstituentsInCharacterArray
        } catch (err) {
            return new HttpError('Nem sikerült lekérni a karakter alkotóelemeinek bejegyzéseit.', 500)
        }
    }

    return objectToAddInfoTo
}

// A function that checks if the request arrived here from the search function in LessonSelect
// (in which case the :charChinese parameter may be a Chinese character, a keyword or a primitiveMeaning),
// or elsewhere (in which case it should only be a Chinese character).
const checkIfSearch = async (req, res, next) => {
    // Gets the type of request, i.e. what comes after "api/".
    // Is either "/char/:charChinese", "/search/:charChinese", or "/force-search/:charChinese", or else the request doesn't arrive here.
    let requestType = req.originalUrl.split('/')[2]
    let requestedChar = req.params.charChinese

    // Gets the user info to customize the shown character for the user, 
    // unless this is a "force search" request, in which case all info should be shown.
    let user, currentTier, currentLesson
    if (requestType === 'force-search') {
        currentTier = 5
        currentLesson = 100
    } else {
        try {
        user = await getUserData(req, res, next)
        currentTier = user.currentTier
        currentLesson = user.currentLesson
        } catch (err) {
            return next(new HttpError('Nem sikerült lekérni a felhasználót.', 500))
        }
    }

    if (requestType === 'search' || requestType === 'force-search') {
        // If this is a search or force-search request, the user should not be eligible to the upcoming lesson.
        currentLesson--
        // All characters in the string must be in the Unicode CJK Unified Ideographs block.
        const chineseCharUnicodeRegex = /^[一-鿕]+$/u;

        if (chineseCharUnicodeRegex.test(requestedChar)) {
            let foundSearchChar = await findCharacter(currentTier, currentLesson, requestedChar, true)
            if (foundSearchChar) {
                if (foundSearchChar.code) return next(foundSearchChar) // If there was an error, throw it.
                else res.json(foundSearchChar)
            } 
        } else {
            let keywordOrPrimitive 
            try {
                keywordOrPrimitive = await Character.findAll({
                    where: {[Op.or]: [
                        {keyword: requestedChar},
                        {primitiveMeaning: requestedChar}
                    ]}
                })
                if (!keywordOrPrimitive || !keywordOrPrimitive.length) {
                    return next(new HttpError('Nincs a keresésnek megfelelő elem.', 404))
                } else {
                    let foundSearchCharsArray = []
                    for (let i = 0; i < keywordOrPrimitive.length; i++) {
                        requestedChar = keywordOrPrimitive[i].dataValues.charChinese
                        let foundSearchChar = await findCharacter(currentTier, currentLesson, requestedChar, true)
                        if (foundSearchChar && !foundSearchChar.code) {
                            foundSearchCharsArray.push(foundSearchChar)
                        }
                    }
                    if (!foundSearchCharsArray.length) {
                        return next(new HttpError('Nincs a keresésnek megfelelő elem, amelyet jogosult lennél megnézni.', 401))
                    } else {
                        res.json(foundSearchCharsArray)
                    }
                }
            } catch (err) {
                return new HttpError('Nem sikerült lekérni az adatbázist.', 500)
            }
        }

    } else {
        findCharacter(currentTier, currentLesson, requestedChar, true)
    }
}

exports.findCharacter = findCharacter
exports.findAdditionalInfo = findAdditionalInfo
exports.checkIfSearch = checkIfSearch