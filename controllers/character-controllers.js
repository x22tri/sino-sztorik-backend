const { Op } = require('sequelize');

const Character = require('../models/characters');
const CharacterOrder = require('../models/character-orders');
const OtherUse = require('../models/other-uses');
const HttpError = require('../models/http-error');

const getUserData = require('../util/getUserData');

const {
  findBareCharacter,
} = require('./character-controllers-utils/findCharacter');

const { findSimilars } = require('./character-controllers-utils/findSimilars');
const { findPhrases } = require('./character-controllers-utils/findPhrases');

const {
  USER_QUERY_FAILED_ERROR,
  DATABASE_QUERY_FAILED_ERROR,
  SEARCH_NO_MATCH,
  OTHER_USES_DATABASE_QUERY_FAILED_ERROR,
  CONSTITUENTS_QUERY_FAILED_ERROR,
  CONSTITUENT_ENTRY_QUERY_FAILED_ERROR,
  SEARCH_NO_ELIGIBLE_MATCH,
} = require('../util/string-literals');
const { StoryBraceType } = require('../util/enums/enums');
const {
  COURSE_FINISHED_TIER,
  COURSE_FINISHED_LESSON_NUMBER,
} = require('../util/config');

CharacterOrder.belongsTo(Character, { foreignKey: 'charId' });
Character.hasOne(CharacterOrder, { foreignKey: 'charId' });

async function findCharacter(
  currentTier,
  currentLesson,
  requestedChar,
  supplementsNeeded = false
) {
  const progress = { tier: currentTier, lessonNumber: currentLesson };

  const bareCharacter = await findBareCharacter(
    currentTier,
    currentLesson,
    requestedChar
  );

  if (supplementsNeeded === false) {
    return bareCharacter;
  }

  const fullCharacter = await findSupplements(
    currentTier,
    currentLesson,
    bareCharacter
  );

  return fullCharacter;
}

const findSupplements = async (
  currentTier,
  currentLesson,
  requestedChar,
  admin = false
) => {
  let objectToAddInfoTo = admin ? {} : requestedChar;

  [objectToAddInfoTo.similarAppearance, objectToAddInfoTo.similarMeaning] =
    await findSimilars(currentTier, currentLesson, requestedChar, admin);

  objectToAddInfoTo.phrases = await findPhrases(
    currentTier,
    currentLesson,
    requestedChar,
    admin
  );

  // Finds the other uses of the character.
  let foundCharInOtherUses;
  try {
    foundCharInOtherUses = await OtherUse.findAll({
      where: { charChinese: requestedChar.charChinese },
      order: ['pinyin'],
      // Sort by pinyin (accent-sensitive).
      attributes: ['pinyin', 'otherUseHungarian'],
    });
    // Removes duplicate pinyins.
    if (foundCharInOtherUses && foundCharInOtherUses.length > 1) {
      let previousDifferentPinyin = foundCharInOtherUses[0].pinyin;
      for (let i = 1; i < foundCharInOtherUses.length; i++) {
        if (foundCharInOtherUses[i].pinyin !== previousDifferentPinyin) {
          previousDifferentPinyin = foundCharInOtherUses[i].pinyin;
        } else {
          foundCharInOtherUses[i].pinyin = undefined;
        }
      }
    }
  } catch (err) {
    return new HttpError(OTHER_USES_DATABASE_QUERY_FAILED_ERROR, 500);
  }
  objectToAddInfoTo.otherUses = foundCharInOtherUses;

  // Generates a constituent list for the character (if not present already) based on its story.
  // Constituents are in the format {charChinese|text to display}.
  // For the admin interface, this is generated on the fly as the story can be changed, so it will not be sent from here.
  if (
    !requestedChar.constituents ||
    (!requestedChar.constituents.length && !admin)
  ) {
    try {
      let collectedConstituentsArray = [];
      collectedConstituentsArray = requestedChar.story
        .split(/[{}]/)
        .filter(substring => substring.includes('|'))
        .filter(
          bracesElement =>
            bracesElement.split('|')[0] !== StoryBraceType.PRIMITIVE &&
            bracesElement.split('|')[0] !== StoryBraceType.KEYWORD
        )
        .map(substring => substring.split('|')[0])
        .filter((item, pos, self) => self.indexOf(item) === pos);

      requestedChar.constituents = collectedConstituentsArray;
    } catch (err) {
      return new HttpError(CONSTITUENTS_QUERY_FAILED_ERROR, 500);
    }
  } else {
    // If the character does have its "constituents" field populated (in CSV), convert it to an array.
    try {
      requestedChar.constituents = requestedChar.constituents.split(',');
    } catch (err) {
      return new HttpError(CONSTITUENTS_QUERY_FAILED_ERROR, 500);
    }
  }

  // Finds the character entries for the given charChineses.
  if (
    requestedChar.constituents &&
    requestedChar.constituents.length &&
    !admin
  ) {
    try {
      let foundConstituentsInCharacterArray = [];
      for (let i = 0; i < requestedChar.constituents.length; i++) {
        let currentConstituent;
        currentConstituent = await findCharacter(
          currentTier,
          currentLesson,
          requestedChar.constituents[i],
          false
        );
        if (currentConstituent) {
          foundConstituentsInCharacterArray.push(currentConstituent);
        }
        // Note: if the constituent can't be found, a {code: 404} will be pushed into the array.
        // This should be handled on the frontend.
        // It should be kept in as it points out the gaps in the database.
      }
      requestedChar.constituents = foundConstituentsInCharacterArray;
    } catch (err) {
      return new HttpError(CONSTITUENT_ENTRY_QUERY_FAILED_ERROR, 500);
    }
  }

  return objectToAddInfoTo;
};

// A function that checks if the request arrived here from the search function in LessonSelect
// (in which case the :charChinese parameter may be a Chinese character, a keyword or a primitiveMeaning),
// or elsewhere (in which case it should only be a Chinese character).
const checkIfSearch = async (req, res, next) => {
  // Gets the type of request, i.e. what comes after "api/".
  // Is either "/char/:charChinese", "/search/:charChinese", or "/force-search/:charChinese", or else the request doesn't arrive here.
  let requestType = req.originalUrl.split('/')[2];
  let requestedChar = req.params.charChinese;

  // Gets the user info to customize the shown character for the user,
  // unless this is a "force search" request, in which case all info should be shown.
  let user, currentTier, currentLesson;
  if (requestType === 'force-search') {
    currentTier = COURSE_FINISHED_TIER;
    currentLesson = COURSE_FINISHED_LESSON_NUMBER;
  } else {
    try {
      user = await getUserData(req, res, next);
      currentTier = user.currentTier;
      currentLesson = user.currentLesson;
    } catch (err) {
      return next(new HttpError(USER_QUERY_FAILED_ERROR, 500));
    }
  }

  if (requestType === 'search' || requestType === 'force-search') {
    // If this is a search or force-search request, the user should not be eligible to the upcoming lesson.
    currentLesson--;
    // All characters in the string must be in the Unicode CJK Unified Ideographs block.
    const chineseCharUnicodeRegex = /^[一-鿕]+$/u;

    if (chineseCharUnicodeRegex.test(requestedChar)) {
      let foundSearchChar = await findCharacter(
        currentTier,
        currentLesson,
        requestedChar,
        true
      );
      if (foundSearchChar) {
        if (foundSearchChar.code)
          return next(foundSearchChar); // If there was an error, throw it.
        else res.json(foundSearchChar);
      }
    } else {
      let keywordOrPrimitive;
      try {
        keywordOrPrimitive = await Character.findAll({
          where: {
            [Op.or]: [
              { keyword: requestedChar },
              { primitiveMeaning: requestedChar },
            ],
          },
        });
        if (!keywordOrPrimitive || !keywordOrPrimitive.length) {
          return next(new HttpError(SEARCH_NO_MATCH, 404));
        } else {
          let foundSearchCharsArray = [];
          for (let i = 0; i < keywordOrPrimitive.length; i++) {
            requestedChar = keywordOrPrimitive[i].dataValues.charChinese;
            let foundSearchChar = await findCharacter(
              currentTier,
              currentLesson,
              requestedChar,
              true
            );
            if (foundSearchChar && !foundSearchChar.code) {
              foundSearchCharsArray.push(foundSearchChar);
            }
          }
          if (!foundSearchCharsArray.length) {
            return next(new HttpError(SEARCH_NO_ELIGIBLE_MATCH, 401));
          } else {
            res.json(foundSearchCharsArray);
          }
        }
      } catch (err) {
        return new HttpError(DATABASE_QUERY_FAILED_ERROR, 500);
      }
    }
  } else {
    findCharacter(currentTier, currentLesson, requestedChar, true);
  }
};

exports.findCharacter = findCharacter;
exports.findSupplements = findSupplements;
exports.checkIfSearch = checkIfSearch;
