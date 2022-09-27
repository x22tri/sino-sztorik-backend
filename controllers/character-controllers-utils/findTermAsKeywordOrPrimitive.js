const { Op } = require('sequelize');
const Character = require('../../models/characters');
const HttpError = require('../../models/http-error');

const {
  DATABASE_QUERY_FAILED_ERROR,
  SEARCH_NO_MATCH,
} = require('../util/string-literals');

async function findTermAsKeywordOrPrimitive(searchTerm) {
  try {
    const keywordsOrPrimitives = await Character.findAll({
      where: {
        [Op.or]: [{ keyword: searchTerm }, { primitiveMeaning: searchTerm }],
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

module.exports = {
  findTermAsKeywordOrPrimitive,
};
