import { Progress } from '../interfaces.js';
import { INVALID_NUMBERS_PROVIDED } from '../string-literals.js';

class HasProgress implements Progress {
  tier: number;
  lessonNumber: number;
  indexInLesson?: number;

  constructor({ tier, lessonNumber, indexInLesson }: Progress) {
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

  comesLaterThan(secondState: Progress): boolean {
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

export { HasProgress };
