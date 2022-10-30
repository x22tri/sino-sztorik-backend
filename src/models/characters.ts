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
  charId!: string;
  charChinese!: string;
  keyword?: string | null;
  pinyin?: string | null;
  story?: string | null;
  primitiveMeaning?: string | null;
  explanation?: string | null;
  notes?: string | null;
  productivePhonetic?: boolean | null;
  frequency?: number | null;
  illustrationAltText?: string | null;
  constituents?: string | null;
  prequel?: string | null;
  reminder?: boolean | null;
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
