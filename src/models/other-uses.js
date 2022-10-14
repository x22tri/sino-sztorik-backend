import Sequelize from 'sequelize';
import sequelize from '../util/database.js';

const OtherUse = sequelize.define(
  'otheruse',
  {
    otherUseId: {
      // unique ID in this table
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    charChinese: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    otherUseHungarian: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    pinyin: {
      // Must be collated in an accent-sensitive way.
      type: Sequelize.STRING,
    },
  },
  {
    timestamps: false,
  },
  {
    charset: 'utf8mb4',
    collate: 'utf8mb4_0900_as_ci',
  }
);

export default OtherUse;
