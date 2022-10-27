import { DataTypes, FindOptions, Model } from 'sequelize';
const { INTEGER, STRING, FLOAT } = DataTypes;

import sequelize from '../util/database.js';
import Character from './characters.js';
import { findAllAndHoist } from '../util/methods/findAllAndHoist.js';

class CharacterOrder extends Model {
  static async findAllAndHoist(
    query: FindOptions
  ): Promise<(CharacterOrder & Model)[]> {
    return await findAllAndHoist(this, query);
  }

  // implements HasProgress? static async comesLaterThan?
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
