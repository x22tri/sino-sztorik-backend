import CharacterOrder from '../../models/character-orders.js';
import Character from '../../models/characters.js';
import { FullCharacter, Progress } from '../interfaces.js';
import { HasProgress } from './HasProgress.js';

class AssembledLesson implements Progress {
  tier!: number;
  lessonNumber!: number;
  name!: string;
  preface!: string;
  characters!: Character[] | FullCharacter[];
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

    const progressMethods = new HasProgress(this);

    this.comesLaterThan = progressMethods.comesLaterThan;
    this.getProgress = () => progressMethods.getProgress();
  }
}

export { AssembledLesson };
