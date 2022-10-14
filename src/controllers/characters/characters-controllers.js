import {
  COURSE_FINISHED,
  FORCE_SEARCH_QUERY_PARAM,
} from '../../util/config.js';
import { getUserProgress } from '../users/utils/getUserProgress.js';
import { search } from './utils/search.js';

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

export { handleSearchRequest };
