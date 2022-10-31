import { CharacterOrder } from '../models/character-orders.js';
import Character from '../models/characters.js';
import { INVALID_NUMBERS_PROVIDED } from './string-literals.js';
import { AssembledLesson } from './classes/AssembledLesson.js';

interface Progress {
  tier: number;
  lessonNumber: number;
  indexInLesson?: number;
}

interface AssembledLessonAllTiers {
  lessonNumber: number;
  name: any;
  tiers: AssembledLesson[];
}

export { Progress, AssembledLessonAllTiers };
