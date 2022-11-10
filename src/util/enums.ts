import {
  LESSON_NOT_IN_TIER,
  LESSON_LOCKED,
  LESSON_UPCOMING,
  LESSON_COMPLETED,
} from './string-literals.js';

enum SimilarType {
  APPEARANCE = 'appearance',
  MEANING = 'meaning',
}

enum InteractiveWordType {
  PRIMITIVE = 'p',
  KEYWORD = 'k',
}

const LessonStatuses = {
  NOT_IN_TIER: LESSON_NOT_IN_TIER,
  LOCKED: LESSON_LOCKED,
  UPCOMING: LESSON_UPCOMING,
  COMPLETED: LESSON_COMPLETED,
} as const;

export { SimilarType, InteractiveWordType, LessonStatuses };
