import { NextFunction, Request, Response } from 'express';
import {
  COURSE_FINISHED,
  FORCE_SEARCH_QUERY_PARAM,
} from '../../util/config.js';
import { passError } from '../../util/functions/throwError.js';
import { Progress } from '../../util/interfaces.js';
import { SEARCH_QUERY_FAILED_ERROR } from '../../util/string-literals.js';
import { getUser } from '../users/utils/getUser.js';
import { search } from './utils/search.js';

async function handleSearchRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const searchTerm = req.params.searchTerm;
    const authHeader = req.headers.authorization;

    let progress: Progress;

    if (req.query[FORCE_SEARCH_QUERY_PARAM]) {
      progress = COURSE_FINISHED;
    } else {
      const user = await getUser(authHeader);
      progress = user.getProgress();
    }

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
