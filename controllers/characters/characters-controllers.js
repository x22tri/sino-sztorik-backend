const {
  COURSE_FINISHED,
  FORCE_SEARCH_QUERY_PARAM,
} = require('../../util/config');
const { getUserProgress } = require('../users/utils/getUserProgress');
const { search } = require('./utils/search');

async function handleSearchRequest(req, res, next) {
  try {
    const searchTerm = req.params.searchTerm;

    const progress = req.query[FORCE_SEARCH_QUERY_PARAM]
      ? COURSE_FINISHED
      : await getUserProgress(req);

    const searchResult = await search(searchTerm, progress);

    res.json(searchResult);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleSearchRequest,
};
