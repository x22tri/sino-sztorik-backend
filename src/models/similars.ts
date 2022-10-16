import { Sequelize, DataTypes } from 'sequelize';
const { INTEGER, STRING, ENUM, BOOLEAN } = DataTypes;

import sequelize from '../util/database.js';

const Similar = sequelize.define(
  'similar',
  {
    similarId: {
      // unique ID in this table
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    similarGroup: {
      // checking which characters belong together
      type: INTEGER,
      allowNull: false,
    },
    charChinese: {
      type: STRING,
      allowNull: false,
    },
    similarType: {
      type: ENUM('appearance', 'meaning'),
      allowNull: false,
    },
    similarToPrimitiveMeaning: {
      // is it the primitive meaning that is similar to the others? ("meaning" only)
      type: BOOLEAN,
    },
  },
  {
    timestamps: false,
  }
);

export default Similar;
