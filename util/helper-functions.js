const { INVALID_NUMBERS_PROVIDED } = require('./string-literals');

// A helper function that checks if the user is eligible to see a given lesson or character.
// The variables "tier," "lessonNumber" and "indexInLesson" define the character or lesson we're checking,
// while "currentTier," "currentLesson" and "currentIndexInLesson" defines the user's "current" position.
// The first four variables are obligatory while the last two aren't and are only used for "phrases" and "similars"
// to deal with characters in the same lesson.
const checkEligibilityHelper = (
  tier,
  currentTier,
  lessonNumber,
  currentLesson,
  indexInLesson = undefined,
  currentIndexInLesson = undefined
) => {
  if (
    tier > currentTier ||
    (tier === currentTier && lessonNumber > currentLesson)
  ) {
    return false;
  } else if (
    indexInLesson &&
    currentIndexInLesson &&
    indexInLesson > currentIndexInLesson
  ) {
    return false;
  } else return true;
};

// A method that compares two states (objects that have "tier", "lessonNumber" and optionally "indexInLesson" properties).
// These can be entries from the CharacterOrders table, or objects with the user's current tier and lessonNumber.
Object.defineProperty(Object.prototype, 'comesLaterThan', {
  value: function (secondState) {
    const firstState = Object(this).valueOf();

    if (
      !(
        Number.isInteger(firstState.tier) &&
        Number.isInteger(secondState.tier) &&
        Number.isInteger(firstState.lessonNumber) &&
        Number.isInteger(secondState.lessonNumber)
      )
    ) {
      throw new Error(INVALID_NUMBERS_PROVIDED);
    }

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
      firstState.indexInLesson > secondState.indexInLesson
    ) {
      return true;
    }

    return false;
  },
});

function getProgress(characterObject) {
  return {
    tier: characterObject.tier,
    lessonNumber: characterObject.lessonNumber,
    indexInLesson: characterObject.indexInLesson,
  };
}

module.exports = { checkEligibilityHelper, getProgress };
