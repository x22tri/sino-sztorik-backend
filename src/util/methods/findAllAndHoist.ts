import { FindOptions, Includeable, Model, ModelStatic } from 'sequelize';

function isModel(field: Includeable): field is ModelStatic<Model> {
  return (field as ModelStatic<Model>).options !== undefined;
}

function getFieldToHoist(
  include: Includeable | Includeable[] | undefined
): string {
  if (include === undefined) {
    throw new Error(`The query does not have an 'include' parameter.`);
  }

  if (typeof include === 'string') {
    return include;
  }

  if (Array.isArray(include) && include.length !== 1) {
    throw new Error(`No more than one 'include' parameter can be provided.`);
  }

  let fieldToCheck = Array.isArray(include) ? include[0] : include;

  if (isModel(fieldToCheck) && fieldToCheck.options.name?.singular) {
    return fieldToCheck.options.name.singular;
  }

  throw new Error(`An error occurred while hoisting field.`);
}

async function findAllAndHoist<M extends Model, I extends Model>(
  model: ModelStatic<M>,
  query: FindOptions
) {
  const fieldToHoist = getFieldToHoist(query.include);

  let queryResults = await model.findAll(query);

  for (let i = 0; i < queryResults.length; i++) {
    queryResults[i] = {
      ...queryResults[i],
      ...queryResults[i][fieldToHoist],
      test() {
        console.log('test');
      },
    };

    delete queryResults[i][fieldToHoist];
  }

  return queryResults as (M & I)[];
}

export { findAllAndHoist };
