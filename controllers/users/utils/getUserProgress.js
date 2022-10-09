import { getUser } from './getUser.js';

async function getUserProgress(req) {
  const authHeader = req.headers.authorization;
  const { currentTier, currentLesson, displayName } = await getUser(authHeader);

  return {
    // displayName: displayName,
    tier: currentTier,
    lessonNumber: currentLesson,
  };
}

export { getUserProgress };
