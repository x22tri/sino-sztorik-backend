import { Op } from 'sequelize';
const { or } = Op;

import Character from '../../../models/characters.js';
import { throwError } from '../../../util/functions/throwError.js';
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
      throwError({ message: SEARCH_NO_MATCH, code: 404 });
    } else {
      return keywordsOrPrimitives;
    }
  } catch (err) {
    throwError({ message: DATABASE_QUERY_FAILED_ERROR, code: 500 });
  }
}

export { findTermAsKeywordOrPrimitive };
