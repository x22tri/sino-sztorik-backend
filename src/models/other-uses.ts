import { Sequelize, DataTypes } from 'sequelize';
const { INTEGER, STRING } = DataTypes;
import sequelize from '../util/database.js';

const OtherUse = sequelize.define(
  'otheruse',
  {
    otherUseId: {
      // unique ID in this table
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    charChinese: {
      type: STRING,
      allowNull: false,
    },
    otherUseHungarian: {
      type: STRING,
      allowNull: false,
    },
    pinyin: {
      // Must be collated in an accent-sensitive way.
      type: STRING,
    },
  },
  {
    timestamps: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_0900_as_ci',
  }
);

export default OtherUse;
