import { Sequelize, DataTypes } from 'sequelize';
const { INTEGER, STRING, BOOLEAN, VIRTUAL } = DataTypes;
import sequelize from '../util/database.js';

const Character = sequelize.define(
  'character',
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
    timestamps: false,
  }
);

export default Character;
