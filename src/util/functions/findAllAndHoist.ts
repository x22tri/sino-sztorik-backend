import { Model, ModelStatic } from 'sequelize';
import { FindOptionsSingleInclude } from '../interfaces.js';

async function findAllAndHoist<M extends Model, I extends Model>(
  model: ModelStatic<M>,
  query: FindOptionsSingleInclude<I>
) {
  const fieldToHoist = query.include.options.name?.singular;

  if (!fieldToHoist) {
    throw new Error(`The field to hoist could not be found.`);
  }

  let x = await model.findAll({ ...query, raw: false, nest: true });

  let queryResults = x.map(queryResult => {
    let nestedValue = queryResult
      .getDataValue(fieldToHoist)
      .get({ plain: true });

    for (let i = 0; i < Object.keys(nestedValue).length; i++) {
      let [key, value] = Object.entries(nestedValue)[i];
      queryResult.setDataValue(key, value);
      queryResult.setDataValue(fieldToHoist, undefined);
    }

    return queryResult;
  });

  return queryResults as (M & I)[];
}

export { findAllAndHoist };
