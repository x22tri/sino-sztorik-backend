const { getUser } = require('./utils/getUser');

const { updateUserInDatabase } = require('./utils/updateUserInDatabase');
const { findNextLesson } = require('./utils/findNextLesson');

async function advanceUser(req, res, next) {
  try {
    const user = await getUser(req.headers.authorization);

    const { currentTier, currentLesson } = user;

    const nextLesson = await findNextLesson(currentTier, currentLesson);

    const updateSuccessful = await updateUserInDatabase(user, nextLesson);

    res.json(updateSuccessful);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  advanceUser,
};
