import {
  DataTypes,
  FindOptions,
  Includeable,
  Model,
  ModelStatic,
} from 'sequelize';
const { INTEGER, STRING, FLOAT } = DataTypes;

import sequelize from '../util/database.js';
import Character from './characters.js';

function isModel(
  singleIncludedField: Includeable
): singleIncludedField is ModelStatic<Model<any, any>> {
  return (
    (singleIncludedField as ModelStatic<Model<any, any>>).options !== undefined
  );
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

  if (
    isModel(fieldToCheck) &&
    fieldToCheck.options.name?.singular !== undefined
  ) {
    return fieldToCheck.options.name.singular;
  }

  throw new Error(`An error occurred while hoisting field.`);
}

class CharacterOrder extends Model {
  static async findAllAndFlattene(query: FindOptions) {
    const fieldToHoist = getFieldToHoist(query.include);

    let queryResults = await this.findAll(query);

    for (let i = 0; i < queryResults.length; i++) {
      queryResults[i] = {
        ...queryResults[i],
        ...queryResults[i][fieldToHoist],
      };

      delete queryResults[i][fieldToHoist];
    }

    return queryResults;
  }
}

CharacterOrder.init(
  {
    orderId: {
      type: FLOAT,
      allowNull: false,
      primaryKey: true,
    },
    charId: {
      type: STRING,
      allowNull: false,
      references: {
        model: Character,
        key: 'charId',
      },
    },
    tier: {
      type: INTEGER,
      allowNull: false,
    },
    lessonNumber: {
      type: INTEGER,
      allowNull: false,
    },
    indexInLesson: {
      type: INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'characterOrder',
    timestamps: false,
  }
);

export { CharacterOrder };
