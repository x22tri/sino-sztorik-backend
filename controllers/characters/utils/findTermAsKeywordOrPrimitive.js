import { Op } from 'sequelize';
const { or } = Op;

import Character from '../../../models/characters.js';
import HttpError from '../../../models/http-error.js';
import {
  DATABASE_QUERY_FAILED_ERROR,
  SEARCH_NO_MATCH,
} from '../../../util/string-literals.js';

async function findTermAsKeywordOrPrimitive(searchTerm) {
  try {
    const keywordsOrPrimitives = await Character.findAll({
      where: {
        [or]: [{ keyword: searchTerm }, { primitiveMeaning: searchTerm }],
      },
      raw: true,
    });

    if (!keywordsOrPrimitives?.length) {
      throw new HttpError(SEARCH_NO_MATCH, 404);
    } else {
      return keywordsOrPrimitives;
    }
  } catch (err) {
    throw new HttpError(DATABASE_QUERY_FAILED_ERROR, 500);
  }
}

export { findTermAsKeywordOrPrimitive };
