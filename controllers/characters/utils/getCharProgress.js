function getCharProgress(characterObject) {
  const { tier, lessonNumber, indexInLesson } = characterObject;
  return { tier, lessonNumber, indexInLesson };
}

module.exports = { getCharProgress };
