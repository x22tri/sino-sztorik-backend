const { getUser } = require('../controllers/users/utils/getUser');

async function getUserProgress(req) {
  const authHeader = req.headers.authorization;
  const { currentTier, currentLesson, displayName } = await getUser(authHeader);

  return {
    displayName: displayName,
    tier: currentTier,
    lessonNumber: currentLesson,
  };
}

function getCharProgress(characterObject) {
  const { tier, lessonNumber, indexInLesson } = characterObject;
  return { tier, lessonNumber, indexInLesson };
}

module.exports = { getUserProgress, getCharProgress };
