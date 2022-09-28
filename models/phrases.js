const Sequelize = require('sequelize');
const sequelize = require('../util/database');

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

module.exports = Phrase;
