import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
const { INTEGER, STRING, BOOLEAN, VIRTUAL } = DataTypes;

import sequelize from '../util/database.js';

class Character extends Model<
  InferAttributes<Character>,
  InferCreationAttributes<Character>
> {
  declare charId: string;
  declare charChinese: string;
  declare keyword?: string | null;
  declare pinyin?: string | null;
  declare story?: string | null;
  declare primitiveMeaning?: string | null;
  declare explanation?: string | null;
  declare notes?: string | null;
  declare productivePhonetic?: boolean | null;
  declare frequency: number | null;
  declare illustrationAltText: string | null;
  declare constituents: string | null;
  declare prequel: string | null;
  declare reminder: boolean | null;
}

Character.init(
  {
    charId: {
      type: STRING,
      allowNull: false,
      primaryKey: true,
    },
    charChinese: {
      type: STRING,
      allowNull: false,
    },
    keyword: {
      type: STRING,
    },
    pinyin: {
      type: STRING,
    },
    story: {
      type: STRING(2500),
    },
    primitiveMeaning: {
      type: STRING,
    },
    explanation: {
      type: STRING,
    },
    notes: {
      type: STRING(1500),
    },
    productivePhonetic: {
      type: BOOLEAN,
    },
    frequency: {
      type: INTEGER,
    },
    illustrationAltText: {
      type: STRING,
    },
    constituents: {
      // Comma-separated values
      type: STRING,
    },
    prequel: {
      type: STRING,
    },
    reminder: {
      // Bool value set when it's not the first occurrence of a character.
      type: VIRTUAL,
    },
  },
  {
    sequelize,
    modelName: 'character',
    timestamps: false,
  }
);

export default Character;
