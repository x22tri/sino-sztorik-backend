import {
  COURSE_FINISHED,
  FORCE_SEARCH_QUERY_PARAM,
} from '../../util/config.js';
import { passError } from '../../util/functions/throwError.js';
import { SEARCH_QUERY_FAILED_ERROR } from '../../util/string-literals.js';
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
  } catch (error) {
    passError(
      { error, fallbackMessage: SEARCH_QUERY_FAILED_ERROR, fallbackCode: 500 },
      next
    );
  }
}

export { handleSearchRequest };
