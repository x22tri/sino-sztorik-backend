import Sequelize from 'sequelize';
import sequelize from '../util/database.js';

const Similar = sequelize.define(
  'similar',
  {
    similarId: {
      // unique ID in this table
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    similarGroup: {
      // checking which characters belong together
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    charChinese: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    similarType: {
      type: Sequelize.ENUM(['appearance', 'meaning']),
      allowNull: false,
    },
    similarToPrimitiveMeaning: {
      // is it the primitive meaning that is similar to the others? ("meaning" only)
      type: Sequelize.BOOLEAN,
    },
  },
  {
    timestamps: false,
  }
);

export default Similar;
