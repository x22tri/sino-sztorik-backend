import { CharacterOrder } from '../../models/character-orders.js';
import Character from '../../models/characters.js';
import { FullChar, Progress } from '../interfaces.js';
import { HasProgress } from './HasProgress.js';

class AssembledLesson implements Progress {
  tier!: number;
  lessonNumber!: number;
  name!: string;
  preface!: string;
  characters!: Character[] | FullChar[];
  status?: string;
  getProgress: () => Progress;
  comesLaterThan: (secondState: Progress) => boolean;

  constructor({
    tier,
    lessonNumber,
    name,
    preface,
    characters,
    status = undefined,
  }: {
    tier: number;
    lessonNumber: number;
    name: string;
    preface: string;
    characters: (CharacterOrder & Character)[];
    status?: string;
  }) {
    this.tier = tier;
    this.lessonNumber = lessonNumber;
    this.name = name;
    this.preface = preface;
    this.characters = characters;
    this.status = status;

    const { comesLaterThan, getProgress } = new HasProgress(this);
    this.comesLaterThan = comesLaterThan;
    this.getProgress = getProgress;
  }
}

export { AssembledLesson };
