function getProgress(characterObject) {
  return {
    tier: characterObject.tier,
    lessonNumber: characterObject.lessonNumber,
    indexInLesson: characterObject.indexInLesson,
  };
}

module.exports = { getProgress };
