const { INVALID_NUMBERS_PROVIDED } = require('./string-literals');

// A method that compares two progress states (objects that have "tier", "lessonNumber" and optionally "indexInLesson" properties).
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

module.exports = { getProgress };
