// A helper function that checks if the user is eligible to see a given lesson or character.
// Every odd variable (currentTier, currentLesson, currentIndexInLesson) defines the user's "current" position,
// while every even variable defines the character or lesson we're checking.
// The first four variables are obligatory while the last two aren't and are only used for "phrases" and "similars"
// to deal with characters in the same lesson.
const checkEligibilityHelper = (tier, currentTier, lessonNumber, currentLesson, indexInLesson = undefined, currentIndexInLesson = undefined) => {
    // if (isNaN(tier) || isNaN(currentTier) || isNan(lessonNumber) || isNaN(currentLesson)) {
    //   return new Error('Érvénytelen számértékek megadva.')
    // }
    if (tier > currentTier || (tier === currentTier && lessonNumber > currentLesson)) {
      return false 
    } else if (indexInLesson && currentIndexInLesson && indexInLesson > currentIndexInLesson) {
        return false
      } else return true
    } 

  exports.checkEligibilityHelper = checkEligibilityHelper
