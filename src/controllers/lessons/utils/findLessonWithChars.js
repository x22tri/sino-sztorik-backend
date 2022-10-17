import { Op } from 'sequelize';
const { eq, lte } = Op;

import { CharacterOrder } from '../../../models/character-orders.js';
import Character from '../../../models/characters.js';
import HttpError from '../../../models/http-error.js';
import { findAllLessonObjects } from './findAllLessonObjects.js';
import { LESSON_DATABASE_QUERY_FAILED_ERROR } from '../../../util/string-literals.js';
import { LESSON_PREFACE_TIER_PREFIX } from '../../../util/config.js';
import lessonsCache from '../lessons-cache.js';
import { findCharByCharChinese } from '../../characters/utils/findCharByCharChinese.js';

import {
  addMethods,
  filterByField,
  findAllAndFlatten,
} from '../../../util/methods.js';

/**
 * @typedef {Object} Character
 * @typedef {Object} Lesson
 *
 * @typedef {Object} Progress
 * @property {number} tier The tier the user is currently at.
 * @property {number} lessonNumber The lesson the user is currently at.
 * @property {number} [indexInLesson] The index of the character the user is currently at.
 * /

/**
 * Based on a lesson's progress state (tier and lesson number), finds the lesson object
 * and all characters within the lesson.
 *
 * @param {Progress} lessonProgress - The lesson's progress state (tier and lesson number).
 * @param {boolean} [isReview] - `true` if the request arrives from a lesson review request, `false` otherwise.
 * @returns {Promise<Lesson & Character>} The found lesson.
 */
async function findLessonWithChars(lessonProgress, isReview) {
  try {
    const { tier, lessonNumber } = lessonProgress;

    const lessonDatabase = lessonsCache.get() ?? (await findAllLessonObjects());

    const givenLesson = lessonDatabase[lessonNumber - 1];

    const charsInGivenLesson = await findAllCharsInLesson(
      { tier, lessonNumber },
      !isReview
    );

    return {
      tier,
      lessonNumber,
      name: givenLesson.name,
      preface: givenLesson[LESSON_PREFACE_TIER_PREFIX + tier],
      characters: charsInGivenLesson,
    };
  } catch (err) {
    return new HttpError(LESSON_DATABASE_QUERY_FAILED_ERROR, 500);
  }
}

/**
 * Takes a progress state and returns the characters in the given lesson.
 *
 * @param {Progress} progress - The progress state (tier and lesson number) to query.
 * @param {boolean} exactTierOnly - `true` if you want to get a given lesson's chars from only the tier provided in `progress`.
 * `false` if you want all tiers up to (less than or equal to) the provided tier.
 * @returns {Promise<CharacterOrder & Character>} An array of CharacterOrder objects with the corresponding character objects.
 */
async function findAllCharsInLesson(progress, exactTierOnly) {
  try {
    const tierOperator = exactTierOnly ? eq : lte;
    const { tier, lessonNumber } = progress;

    addMethods(CharacterOrder, [findAllAndFlatten]);

    //@ts-ignore
    let charsInGivenLesson = await CharacterOrder.findAllAndFlatten({
      where: {
        tier: { [tierOperator]: tier },
        lessonNumber: { [eq]: lessonNumber },
      },
      include: [Character],
      raw: true,
      nest: true,
    });

    // console.log(charsInGivenLesson);

    // let carr = [];
    // for (let c of charsInGivenLesson) {
    //   let cbare = await findCharByCharChinese(c.charChinese, progress);
    //   // console.log(cbare);
    //   carr.push(cbare);
    // }

    // addMethods(charsInGivenLesson, [filterByField]);

    // charsInGivenLesson.filterByField('charChinese');

    return charsInGivenLesson;
  } catch (err) {
    console.log(err);
    throw new HttpError(LESSON_DATABASE_QUERY_FAILED_ERROR, 500);
  }
}

export { findLessonWithChars };
