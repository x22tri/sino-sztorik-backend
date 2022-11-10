import { Progress } from './interfaces.js';

const PW_SALT_ROUNDS = 12;
const LAST_TIER = 4;
const COURSE_FINISHED_TIER = LAST_TIER + 1;
const COURSE_FINISHED_LESSON_NUMBER = 100;
const COURSE_FINISHED: Progress = {
  tier: COURSE_FINISHED_TIER,
  lessonNumber: COURSE_FINISHED_LESSON_NUMBER,
};

const CONSTITUENT_SEPARATOR = ',';
const INTERACTIVE_WORD_WRAPPER = '{}';
const INTERACTIVE_WORD_SEPARATOR = '|';
const FORCE_SEARCH_QUERY_PARAM = 'force';
const LESSON_PREFACE_TIER_PREFIX = 'prefaceTier';

const ERROR_HANDLING_CONFIGURATION = {
  logGapsInCharacterDatabase: false, // If true, references to characters that don't exist in the Characters table will be logged.
  allowGapsInCharacterDatabase: true, // If true, references to characters that don't exist in the Characters table will throw an error.
};

export {
  LAST_TIER,
  COURSE_FINISHED_TIER,
  COURSE_FINISHED_LESSON_NUMBER,
  COURSE_FINISHED,
  PW_SALT_ROUNDS,
  CONSTITUENT_SEPARATOR,
  INTERACTIVE_WORD_WRAPPER,
  INTERACTIVE_WORD_SEPARATOR,
  FORCE_SEARCH_QUERY_PARAM,
  LESSON_PREFACE_TIER_PREFIX,
  ERROR_HANDLING_CONFIGURATION,
};
