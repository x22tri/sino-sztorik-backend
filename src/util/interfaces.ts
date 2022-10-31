import { Model, FindOptions, ModelStatic } from 'sequelize';
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

interface FindOptionsSingleInclude<I extends Model> extends FindOptions {
  include: ModelStatic<I>;
}

export { Progress, AssembledLessonAllTiers, FindOptionsSingleInclude };
