const { getUser } = require('./getUser');

async function getUserProgress(req) {
  const authHeader = req.headers.authorization;
  const { currentTier, currentLesson, displayName } = await getUser(authHeader);

  return {
    displayName: displayName,
    tier: currentTier,
    lessonNumber: currentLesson,
  };
}

module.exports = { getUserProgress };
