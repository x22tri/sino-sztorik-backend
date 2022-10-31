import { CharacterOrder } from '../models/character-orders.js';
import Character from '../models/characters.js';
import { INVALID_NUMBERS_PROVIDED } from './string-literals.js';

interface Progress {
  tier: number;
  lessonNumber: number;
  indexInLesson?: number;
}

class HasProgress implements Progress {
  tier: number;
  lessonNumber: number;
  indexInLesson?: number;

  constructor({ tier, lessonNumber, indexInLesson = undefined }) {
    this.tier = tier;
    this.lessonNumber = lessonNumber;
    this.indexInLesson = indexInLesson;
  }

  getProgress(): Progress {
    return {
      tier: this.tier,
      lessonNumber: this.lessonNumber,
      indexInLesson: this.indexInLesson,
    };
  }

  comesLaterThan(secondState: Progress) {
    const firstState = this.getProgress();

    if (
      (firstState.indexInLesson &&
        !Number.isInteger(firstState.indexInLesson)) ||
      (secondState.indexInLesson &&
        !Number.isInteger(secondState.indexInLesson))
    ) {
      throw new Error(INVALID_NUMBERS_PROVIDED);
    }

    if (firstState.tier > secondState.tier) {
      return true;
    }

    if (
      firstState.tier === secondState.tier &&
      firstState.lessonNumber > secondState.lessonNumber
    ) {
      return true;
    }

    if (
      firstState.tier === secondState.tier &&
      firstState.lessonNumber === secondState.lessonNumber &&
      firstState.indexInLesson &&
      secondState.indexInLesson &&
      firstState.indexInLesson > secondState.indexInLesson
    ) {
      return true;
    }

    return false;
  }
}

class AssembledLesson extends HasProgress {
  name!: string;
  preface!: string;
  characters!: (CharacterOrder & Character)[];
  status?: string;

  constructor({
    tier,
    lessonNumber,
    name,
    preface,
    characters,
    status = undefined,
  }) {
    super({ tier, lessonNumber });
    this.name = name;
    this.preface = preface;
    this.characters = characters;
    this.status = status;
  }
}

export { Progress, HasProgress, AssembledLesson };
