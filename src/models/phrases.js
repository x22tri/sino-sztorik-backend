import Sequelize from 'sequelize';
import sequelize from '../util/database.js';

const Phrase = sequelize.define(
  'phrase',
  {
    phraseId: {
      // unique ID in this table
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    phraseChinese: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phraseHungarian: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    pinyin: {
      type: Sequelize.STRING,
    },
  },
  {
    timestamps: false,
  }
);

export default Phrase;
