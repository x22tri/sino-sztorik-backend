import {
  LESSON_NOT_IN_TIER,
  LESSON_LOCKED,
  LESSON_UPCOMING,
  LESSON_COMPLETED,
} from './string-literals.js';

const SimilarType = Object.freeze({
  APPEARANCE: 'appearance',
  MEANING: 'meaning',
});

const InteractiveWordType = Object.freeze({
  PRIMITIVE: 'p',
  KEYWORD: 'k',
});

const LessonStatuses = Object.freeze({
  NOT_IN_TIER: LESSON_NOT_IN_TIER,
  LOCKED: LESSON_LOCKED,
  UPCOMING: LESSON_UPCOMING,
  COMPLETED: LESSON_COMPLETED,
});

export { SimilarType, InteractiveWordType, LessonStatuses };
