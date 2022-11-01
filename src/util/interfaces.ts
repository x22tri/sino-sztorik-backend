import { Model, FindOptions, ModelStatic } from 'sequelize';
import { CharacterOrder } from '../models/character-orders.js';
import Character from '../models/characters.js';
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

interface FullCharacter
  extends Omit<CharacterOrder & Character, 'constituents'> {
  similars: { similarAppearance: Character[]; similarMeaning: Character[] };
  phrases: any[];
  otherUses: any[];
  constituents: (CharacterOrder & Character)[];
}

interface FindOptionsSingleInclude<I extends Model> extends FindOptions {
  include: ModelStatic<I>;
}

export {
  Progress,
  AssembledLessonAllTiers,
  FullCharacter,
  FindOptionsSingleInclude,
};
