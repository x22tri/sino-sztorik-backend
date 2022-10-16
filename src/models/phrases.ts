import { Sequelize, DataTypes } from 'sequelize';
const { INTEGER, STRING } = DataTypes;
import sequelize from '../util/database.js';

const Phrase = sequelize.define(
  'phrase',
  {
    phraseId: {
      // unique ID in this table
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    phraseChinese: {
      type: STRING,
      allowNull: false,
    },
    phraseHungarian: {
      type: STRING,
      allowNull: false,
    },
    pinyin: {
      type: STRING,
    },
  },
  {
    timestamps: false,
  }
);

export default Phrase;
