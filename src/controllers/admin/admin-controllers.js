/*
import { Op } from 'sequelize';
const { and, not, like, notIn } = Op;

import RevampedLesson from '../../models/revamped-lessons.js';
import Character from '../../models/characters.js';
import Similar from '../../models/similars.js';
import Phrase from '../../models/phrases.js';
import OtherUse from '../../models/other-uses.js';
import HttpError from '../../models/http-error.js';
import { findLessonWithChars } from '../lessons/utils/findLessonWithChars.js';
import { addSupplements } from '../characters/utils/addSupplements.js';

import {
  LESSON_DATABASE_QUERY_FAILED_ERROR,
  CHARACTER_NOT_FOUND_ERROR,
  SAVING_ERROR,
  SAVING_SUCCESS,
  LESSON_NOT_FOUND_ERROR,
} from '../../util/string-literals.js';

import {
  COURSE_FINISHED_TIER,
  COURSE_FINISHED_LESSON_NUMBER,
} from '../../util/config.js';

const getAllLessons = async (req, res, next) => {
  // The "true" flag gets the preface and the full info about the Chinese characters.
  // const tieredLessonArray = await findAllLessonObjectsHelper(true)
  // res.json({ tieredLessonArray })

  let lessonArray = [];
  try {
    let lessonDatabase = await RevampedLesson.findAll();

    // Iterates over all lessonNumbers and tiers to get all lessons.
    for (
      let lessonNumber = 1;
      lessonNumber < lessonDatabase.length + 1;
      lessonNumber++
    ) {
      let lessonObject = {
        lessonNumber: lessonNumber,
        name: lessonDatabase[lessonNumber - 1].name,
        tiers: [],
      };
      for (let tier = 1; tier < 5; tier++) {
        let foundLesson = await findLessonWithChars(
          tier,
          COURSE_FINISHED_TIER,
          lessonNumber,
          COURSE_FINISHED_LESSON_NUMBER,
          'admin'
        );
        if (foundLesson) lessonObject.tiers.push(foundLesson);
      }
      // The object created has this approximate shape:
      // { lessonNumber: 1, name: '', tiers: [{tier: 1, preface: prefaceTier1, characters: [{...}, {...}], status: ''}, {tier: 2,...}] }
      lessonArray.push(lessonObject);
    }

    res.json({ lessonArray });
  } catch (err) {
    console.log(err);
    return next(new HttpError(LESSON_DATABASE_QUERY_FAILED_ERROR, 500));
  }
};

const getAdditionalInfoAdmin = async (req, res, next) => {
  let requestedCharById = {};
  try {
    requestedCharById.character = await Character.findOne({
      where: { charId: req.params.charId },
    });
    if (!requestedCharById.character)
      return next(new HttpError(CHARACTER_NOT_FOUND_ERROR, 404));
  } catch (err) {
    console.log(err);
  }

  const additionalCharInfo = await addSupplements(requestedCharById, true);
  console.log(additionalCharInfo);
  res.json({ additionalCharInfo });
};

const updateLesson = async (req, res, next) => {
  let updatedLesson;
  try {
    updatedLesson = await RevampedLesson.findOne({
      where: { lessonNumber: req.params.lessonId },
    });
    if (!updatedLesson) return next(new HttpError(LESSON_NOT_FOUND_ERROR, 404));

    // If the lesson was found, update the name and all prefaces.
    // Converts all empty strings to null entries.
    updatedLesson.name = req.body.name;
    for (let i = 1; i < req.body.tiers.length + 1; i++) {
      const foundTier = req.body.tiers.find(element => element.tier === i);
      if (foundTier)
        updatedLesson['prefaceTier' + i] = foundTier.preface || null;
    }

    await updatedLesson.save();
    res.status(200).send({ message: SAVING_SUCCESS });
  } catch (err) {
    console.log(err);
    return next(new HttpError(SAVING_ERROR, 500));
  }
};

const getAllPhrases = async (req, res, next) => {
  let allPhrasesArray;
  try {
    allPhrasesArray = await Phrase.findAll();
  } catch (err) {
    console.log(err);
  }
  res.json(allPhrasesArray);
};

const getAllOtherUses = async (req, res, next) => {
  let allOtherUsesArray;
  try {
    allOtherUsesArray = await OtherUse.findAll();
  } catch (err) {
    console.log(err);
  }
  res.json(allOtherUsesArray);
};

const updateAllPhrasesOrOtherUses = async (req, res, next) => {
  // Find which table we're updating.
  let table, tableId;
  if (req.originalUrl.split('/')[3] === 'all-phrases') {
    table = Phrase;
    tableId = 'phraseId';
  } else if (req.originalUrl.split('/')[3] === 'all-other-uses') {
    table = OtherUse;
    tableId = 'otherUseId';
  } else {
    return next(new HttpError('Érvénytelen útvonal.', 500));
  }

  try {
    // We're expecting an array of objects to be sent in req.body.
    if (!Array.isArray(req.body) || req.body.length === 0)
      return next(new HttpError('Érvénytelen frissítés.', 500));

    // New entries will get an ID from the auto-incrementing database. These need to be sent back to the frontend.
    let newEntriesIDs = [];
    for (let i = 0; i < req.body.length; i++) {
      let updatedEntry = req.body[i];
      let foundEntryInDatabase = await table.findOne({
        where: { [tableId]: updatedEntry[tableId] },
      });

      // If there is a "delete" flag coming with the request, delete the entry.
      if (updatedEntry.delete && foundEntryInDatabase) {
        await foundEntryInDatabase.destroy();
      }
      // If the entry already exists, update all properties.
      else if (foundEntryInDatabase) {
        for (const property in foundEntryInDatabase.dataValues)
          foundEntryInDatabase[property] = updatedEntry[property];
        await foundEntryInDatabase.save();
      } else {
        // If the entry doesn't exist, create it.
        // For the auto-incrementing to work, the tableId has to be removed.
        let temporaryIDSent = updatedEntry[tableId];
        let entryWithoutID = {
          ...updatedEntry,
          id: undefined,
          [tableId]: undefined,
        };
        let createdEntry = await table.create(entryWithoutID);
        newEntriesIDs.push({ [temporaryIDSent]: createdEntry[tableId] });
      }
    }
    res
      .status(200)
      .json({ message: SAVING_SUCCESS, newEntriesIDs: newEntriesIDs });
  } catch (err) {
    console.log(err);
    return next(new HttpError(SAVING_ERROR, 500));
  }
};

const getAllSimilars = async (req, res, next) => {
  // The req.params.similarType should be either "meaning" or "appearance".

  // Gets the database.
  let allSimilarsArray;
  try {
    allSimilarsArray = await Similar.findAll({
      where: { similarType: req.params.similarType },
      order: ['similarGroup'],
    });
  } catch (err) {
    console.log(err);
  }

  // Finds the keyword and primitive meaning for these characters (for "meaning").
  try {
    // let parsedArray = await JSON.parse(JSON.stringify(allSimilarsArray))
    // let keywordAndPrimitiveArray = await Similar.findAll({ order: ['similarGroup'] })
    for (let i = 0; i < allSimilarsArray.length; i++) {
      let foundKeyword, foundPrimitive;

      foundKeyword = await Character.findOne({
        where: {
          [and]: [
            { charChinese: allSimilarsArray[i].charChinese },
            { [not]: [{ keyword: null }] },
          ],
        },
        attributes: ['keyword'],
      });

      if (foundKeyword) foundKeyword = foundKeyword.keyword;

      foundPrimitive = await Character.findOne({
        where: {
          [and]: [
            { charChinese: allSimilarsArray[i].charChinese },
            { [not]: [{ primitiveMeaning: null }] },
          ],
        },
        attributes: ['primitiveMeaning'],
      });

      if (foundPrimitive) foundPrimitive = foundPrimitive.primitiveMeaning;

      allSimilarsArray[i].dataValues.keyword = foundKeyword;
      allSimilarsArray[i].dataValues.primitiveMeaning = foundPrimitive;
      // console.log(allSimilarsArray[i])
    }
  } catch (err) {
    console.log(err);
  }

  // Groups the database into arrays based on the "similarGroup" property.
  let groupedSimilarsArray;
  try {
    groupedSimilarsArray = allSimilarsArray.reduce((acc, item) => {
      acc[item.similarGroup] = [...(acc[item.similarGroup] || []), item];
      return acc;
    }, {});
  } catch (err) {
    console.log(err);
  }

  // console.log(groupedSimilarsArray)

  res.json(groupedSimilarsArray);
};

const updateCharacter = async (req, res, next) => {
  try {
    let charInDatabase = await Character.findOne({
      where: { charId: req.params.charId },
    });
    const char = { ...req.body };

    // If automaticConstituentOverrideCheckbox is true, write to constituents, if false, set constituents to null.
    if (!char.automaticConstituentOverrideCheckbox) char.constituents = null;

    if (!char.productivePhonetic) char.productivePhonetic = null;

    // Converting story to the bracket syntax used in the database.
    let story = char.story;
    try {
      story = JSON.parse(char.story);
    } catch (err) {}
    if (!story || !story[0].children || !Array.isArray(story[0].children)) {
      return next(
        new HttpError(
          'A szerverre beérkező történetnek érvénytelen a szerkezete.',
          400
        )
      );
    } else {
      const storyLeafArray = [...story[0].children];
      let convertedStory = '';

      for (let i = 0; i < storyLeafArray.length; i++) {
        const currentSegment = storyLeafArray[i];
        if (!currentSegment.text) return;
        else if (currentSegment.keyword)
          convertedStory = convertedStory.concat(`{k|${currentSegment.text}}`);
        else if (currentSegment.primitive)
          convertedStory = convertedStory.concat(`{p|${currentSegment.text}}`);
        else if (currentSegment.constituent)
          convertedStory = convertedStory.concat(
            `{${currentSegment.constituent}|${currentSegment.text}}`
          );
        else convertedStory = convertedStory.concat(currentSegment.text);
      }
      char.story = JSON.stringify(convertedStory);
    }

    // If any of the members in similarAppearance and similarMeaning are already in the database, append it to their group.
    // Otherwise, create a new group.
    const writeSimilars = async similarType => {
      let attributeName;
      if (similarType === 'appearance') attributeName = 'similarAppearance';
      if (similarType === 'meaning') attributeName = 'similarMeaning';

      if (!attributeName)
        return new HttpError(
          'Érvénytelen argumentum lett megadva a writeSimilars függvényhez.',
          400
        );
      if (!Array.isArray(char[attributeName]))
        return new HttpError(
          'A szerverre beérkező hasonló karakterek listájának érvénytelen a szerkezete.',
          400
        );

      // If the current character is already in the database, we'll add to its group.
      let foundCurrentCharInSimilar = await Similar.findOne({
        where: { charChinese: char.charChinese, similarType: similarType },
        raw: true,
      });

      for (let i = 0; i < char[attributeName].length; i++) {
        if (foundCurrentCharInSimilar) {
          await Similar.findOrCreate({
            where: {
              [and]: [
                { charChinese: char[attributeName][i] },
                { similarType: similarType },
              ],
            },
            defaults: {
              charChinese: char[attributeName][i],
              similarType: similarType,
              similarGroup: foundCurrentCharInSimilar.similarGroup,
            },
          });

          // If the character is not in the database yet, create a new similarGroup.
        } else {
          // Find the lowest unused group number.
          let similarGroups = await Similar.findAll({
            attributes: ['similarGroup'],
            raw: true,
          });
          let similarGroupArray = similarGroups.map(
            groupObject => groupObject.similarGroup
          );

          similarGroupArray.sort((a, b) => a - b); // Sort in numerical order.
          let newSimilarGroupNumber = 0;
          for (j = 0; j < similarGroupArray.length; j++) {
            if (similarGroupArray[j] === j) newSimilarGroupNumber = j;
            break;
          }
          if (newSimilarGroupNumber === 0)
            newSimilarGroupNumber =
              similarGroupArray[similarGroupArray.length - 1] + 1;

          // Create a new entry for the current char and the first char submitted in the request.
          // For any further chars, the current char will be recognized as existent and the above "if" path will apply.
          foundCurrentCharInSimilar = await Similar.create({
            similarGroup: newSimilarGroupNumber,
            charChinese: char.charChinese,
            similarType: similarType,
          });
          await Similar.create({
            similarGroup: newSimilarGroupNumber,
            charChinese: char[attributeName][i],
            similarType: similarType,
          });
        }
      }

      if (foundCurrentCharInSimilar) {
        // Check for any similars that were removed in the admin screen, and remove them from the database.
        let similarsInDatabase = await Similar.findAll({
          where: {
            similarGroup: foundCurrentCharInSimilar.similarGroup,
            charChinese: { [not]: char.charChinese },
            similarType: similarType,
          },
          raw: true,
        });

        let destroyedCharsCount = 0;
        for (k = 0; k < similarsInDatabase.length; k++) {
          if (
            !char[attributeName].includes(similarsInDatabase[k].charChinese)
          ) {
            destroyedCharsCount++;
            await Similar.destroy({
              where: { similarId: similarsInDatabase[k].similarId },
            });
          }
        }
        // Remove the current char from the similars database if it now has no similars.
        if (destroyedCharsCount === similarsInDatabase.length)
          await Similar.destroy({
            where: { charChinese: char.charChinese, similarType: similarType },
          });
      }
    };

    // Actually execute the function.
    writeSimilars('appearance');
    writeSimilars('meaning');

    // Adding otherUses and phrases. The request here has a different form to updateAllPhrasesOrOtherUses and thus the code cannot be taken from there.
    const writePhrasesOrOtherUses = async attributeName => {
      if (attributeName !== 'phrases' && attributeName !== 'otherUses')
        return new HttpError(
          'Érvénytelen argumentum lett megadva a writePhrasesOrOtherUses függvényhez.',
          400
        );
      if (!Array.isArray(char[attributeName]))
        return new HttpError(
          'A szerverre beérkező kifejezések vagy egyéb használatok listájának érvénytelen a szerkezete.',
          400
        );

      let database, idName, charColumnName;
      // charColumnName refers to the column that contains the charChinese (whether in whole or in part)

      if (attributeName === 'phrases') {
        database = Phrase;
        idName = 'phraseId';
        charColumnName = 'phraseChinese';
      } else {
        database = OtherUse;
        idName = 'otherUseId';
        charColumnName = 'charChinese';
      }

      // Add all new phrases and otherUses.
      for (let i = 0; i < char[attributeName].length; i++) {
        let currentPhraseOrOtherUse = char[attributeName][i];
        if (attributeName === 'otherUses')
          currentPhraseOrOtherUse.charChinese = char.charChinese;
        // If the entry already exists in the database (i.e. has an ID), update its properties.
        if (currentPhraseOrOtherUse[idName]) {
          let foundElementById = await database.findOne({
            where: { [idName]: currentPhraseOrOtherUse[idName] },
          });
          if (foundElementById) {
            for (const property in currentPhraseOrOtherUse)
              foundElementById[property] = currentPhraseOrOtherUse[property];
            // charChinese is not submitted from frontend and needs to be inserted manually for the otherUses table.
            await foundElementById.save();
          }
          // If the entry doesn't exist, create it.
        } else {
          await database.create(currentPhraseOrOtherUse);
        }
      }

      // Remove all entries from the database that can't be found in the request.
      const allIDsInRequest = char[attributeName].map(
        element => element[idName]
      );
      await database.destroy({
        where: {
          [charColumnName]: { [like]: `%${char.charChinese}%` },
          [idName]: { [notIn]: allIDsInRequest },
        },
        raw: true,
      });
    };

    writePhrasesOrOtherUses('phrases');
    writePhrasesOrOtherUses('otherUses');

    // To-Do: actually update the char.
    // charInDatabase.update(char,
    //   {fields: ['charChinese', 'keyword', 'pinyin', 'story', 'primitiveMeaning', 'productivePhonetic', 'frequency', 'constituents']})

    res.status(200).send({ message: SAVING_SUCCESS });
  } catch (err) {
    console.log(err);
    return next(new HttpError(SAVING_ERROR, 500));
  }
};

export {
  getAllLessons,
  getAdditionalInfoAdmin,
  updateLesson,
  getAllPhrases,
  updateAllPhrasesOrOtherUses,
  getAllOtherUses,
  getAllSimilars,
  updateCharacter,
};

*/
