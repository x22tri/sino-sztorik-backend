const { Op } = require('sequelize');

const Character = require('../models/characters');
const CharacterOrder = require('../models/character-orders');
const Similar = require('../models/similars');
const Phrase = require('../models/phrases');
const OtherUse = require('../models/other-uses');
const HttpError = require('../models/http-error');

const getUserData = require('../util/getUserData');
const { checkEligibilityHelper } = require('../util/helper-functions');

// require('../util/helper-functions');

const {
  USER_QUERY_FAILED_ERROR,
  TIER_OR_LESSON_NOT_NUMBER_ERROR,
  CHARACTER_NOT_FOUND_ERROR,
  CHARACTER_QUERY_FAILED_ERROR,
  DATABASE_QUERY_FAILED_ERROR,
  SEARCH_NO_MATCH,
  NOT_ELIGIBLE_TO_SEE_CHARACTER_ERROR,
  SIMILARS_DATABASE_QUERY_FAILED_ERROR,
  PHRASES_DATABASE_QUERY_FAILED_ERROR,
  OTHER_USES_DATABASE_QUERY_FAILED_ERROR,
  CONSTITUENTS_QUERY_FAILED_ERROR,
  CONSTITUENT_ENTRY_QUERY_FAILED_ERROR,
  SEARCH_NO_ELIGIBLE_MATCH,
} = require('../util/string-literals');
const { SimilarType, StoryBraceType } = require('../util/enums/enums');
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
  additionalInfo = false
) {
  if (isNaN(currentTier) || isNaN(currentLesson)) {
    throw new HttpError(TIER_OR_LESSON_NOT_NUMBER_ERROR, 404);
  }

  const currentProgress = {
    tier: currentTier,
    lessonNumber: currentLesson,
  };

  const ids = await findAllCharIdsByChar(requestedChar);
  const characterVersionsInOrder = await findAllCharVersionsByCharIds(ids);
  const firstCharVersion = characterVersionsInOrder[0];

  if (firstCharVersion.comesLaterThan(currentProgress)) {
    throw new HttpError(NOT_ELIGIBLE_TO_SEE_CHARACTER_ERROR, 401);
  }

  let charToMutate = await JSON.parse(JSON.stringify(firstCharVersion));

  try {
    for (let i = 1; i < characterVersionsInOrder.length; i++) {
      const currentCharVersion = characterVersionsInOrder[i];

      if (currentCharVersion.comesLaterThan(currentProgress)) {
        break; // If a user is ineligible for one version, they'll be ineligible for all versions after that.
        // (This presupposes that the versions have been sorted beforehand during the function.)
      }

      if (currentCharVersion.charId === firstCharVersion.charId) {
        charToMutate.reminder = true;
      }

      if (currentCharVersion.primitiveMeaning !== null) {
        charToMutate.newPrimitive = true;
      }

      replaceNewProperties(currentCharVersion, charToMutate);
    }
  } catch (err) {
    throw new HttpError(DATABASE_QUERY_FAILED_ERROR, 500);
  }

  return additionalInfo
    ? await findAdditionalInfo(currentTier, currentLesson, charToMutate)
    : charToMutate;
}

async function findAllCharIdsByChar(requestedChar) {
  let currentCharEntries;

  try {
    currentCharEntries = await Character.findAll({
      where: { charChinese: requestedChar },
      attributes: ['charId'],
    });
  } catch (err) {
    throw new HttpError(CHARACTER_QUERY_FAILED_ERROR, 500);
  }

  if (!currentCharEntries?.length) {
    throw new HttpError(CHARACTER_NOT_FOUND_ERROR, 404);
  }

  return currentCharEntries.map(entry => entry.charId);
}

async function findAllCharVersionsByCharIds(charIds) {
  let characterVersionsInOrder;

  try {
    characterVersionsInOrder = await CharacterOrder.findAll({
      where: { charId: charIds },
      include: [Character],
      order: [['tier'], ['lessonNumber'], ['indexInLesson']],
      raw: true,
      nest: true,
    });
  } catch (err) {
    throw new HttpError(DATABASE_QUERY_FAILED_ERROR, 500);
  }

  if (!characterVersionsInOrder?.length) {
    throw new HttpError(SEARCH_NO_MATCH, 404);
  }

  const characterVersionsInOrderFlattened = characterVersionsInOrder.map(
    char => {
      char = { ...char, ...char.character };
      delete char.character;

      return char;
    }
  );

  return characterVersionsInOrderFlattened;
}

function replaceNewProperties(currentCharVersion, charToMutate) {
  for (const prop in currentCharVersion) {
    if (currentCharVersion[prop]) {
      charToMutate[prop] = currentCharVersion[prop];
    }
  }
}

const findAdditionalInfo = async (
  currentTier,
  currentLesson,
  requestedChar,
  admin = false
) => {
  let objectToAddInfoTo = admin ? {} : requestedChar;

  [objectToAddInfoTo.similarAppearance, objectToAddInfoTo.similarMeaning] =
    await findSimilars(currentTier, currentLesson, requestedChar, admin);

  // Find phrases with the character.
  let foundCharInPhrases;
  let foundPhraseCharArray = [];
  try {
    foundCharInPhrases = await Phrase.findAll({
      where: {
        phraseChinese: {
          [Op.like]: `%${requestedChar.charChinese}%`,
        },
      },
    });
    // Go through each character in each phrase.
    // If user is not eligible for at least one of the characters, don't show the phrase altogether.
    if (foundCharInPhrases) {
      if (admin) {
        // No eligibility checks or character breakdown needed if the function is called with "admin".
        foundPhraseCharArray = foundCharInPhrases;
      } else {
        for (let i = 0; i < foundCharInPhrases.length; i++) {
          let allCharsInGivenPhrase = [];
          for (let j = 0; j < foundCharInPhrases[i].phraseChinese.length; j++) {
            try {
              let charInGivenPhrase;
              charInGivenPhrase = await findCharacter(
                currentTier,
                currentLesson,
                foundCharInPhrases[i].phraseChinese.charAt(j),
                false
              );
              if (
                !charInGivenPhrase ||
                charInGivenPhrase.code ||
                !checkEligibilityHelper(
                  charInGivenPhrase.tier,
                  requestedChar.tier,
                  charInGivenPhrase.lessonNumber,
                  requestedChar.lessonNumber,
                  charInGivenPhrase.indexInLesson,
                  requestedChar.indexInLesson
                )
              ) {
                continue;
              }
              allCharsInGivenPhrase.push(charInGivenPhrase);

              if (
                allCharsInGivenPhrase.length ===
                foundCharInPhrases[i].phraseChinese.length
              ) {
                foundCharInPhrases[i].dataValues.characters =
                  allCharsInGivenPhrase;
                foundPhraseCharArray.push(foundCharInPhrases[i]);
              }
            } catch (err) {
              continue;
            }
          }
        }
      }
    }
  } catch (err) {
    return new HttpError(PHRASES_DATABASE_QUERY_FAILED_ERROR, 500);
  }
  objectToAddInfoTo.phrases = foundPhraseCharArray;

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
            bracesElement.split('|')[0] !== StoryBraceType.Primitive &&
            bracesElement.split('|')[0] !== StoryBraceType.Keyword
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

async function findCharInSimilarDB(requestedChar) {
  const foundRequestedCharInDB = await Similar.findOne({
    where: { charChinese: requestedChar.charChinese },
    raw: true,
  });

  return foundRequestedCharInDB;
}

async function findCharsInSameSimilarGroup(similarEntry) {
  const similarChars = await Similar.findAll({
    where: {
      [Op.and]: [
        { similarGroup: similarEntry.similarGroup },
        {
          [Op.not]: [{ charChinese: similarEntry.charChinese }],
        },
      ],
    },
    raw: true,
  });

  return similarChars;
}

async function findSimilars(currentTier, currentLesson, requestedChar, admin) {
  let similarAppearanceArray = [];
  let similarMeaningArray = [];
  const emptyResponse = [[], []];

  try {
    const foundRequestedCharInDB = await findCharInSimilarDB(requestedChar);

    if (!foundRequestedCharInDB) {
      return emptyResponse;
    }

    const similarChars = await findCharsInSameSimilarGroup(
      foundRequestedCharInDB
    );

    if (!similarChars?.length) {
      return emptyResponse;
    }

    for (const similarChar of similarChars) {
      try {
        const latestEligibleVersion = admin
          ? similarChar
          : await findCharacter(
              currentTier,
              currentLesson,
              similarChar.charChinese,
              false
            );

        if (!latestEligibleVersion) {
          continue;
        }

        // The findCharacter call earlier already filters out the characters in higher tiers or lessons,
        // but not those that are in the same lesson but come later.
        if (latestEligibleVersion.comesLaterThan(requestedChar)) {
          continue;
        }

        if (similarChar.similarType === SimilarType.Appearance) {
          similarAppearanceArray.push(latestEligibleVersion);
        }

        if (similarChar.similarType === SimilarType.Meaning) {
          latestEligibleVersion.similarToPrimitiveMeaning =
            similarChar.similarToPrimitiveMeaning || undefined;

          similarMeaningArray.push(latestEligibleVersion);
        }
        // An error returned from findCharacter should only skip the character in question, not crash the application.
      } catch (err) {
        continue;
      }
    }
  } catch (err) {
    throw new HttpError(SIMILARS_DATABASE_QUERY_FAILED_ERROR, 500);
  }

  return [similarAppearanceArray, similarMeaningArray];
}

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
exports.findAdditionalInfo = findAdditionalInfo;
exports.checkIfSearch = checkIfSearch;
