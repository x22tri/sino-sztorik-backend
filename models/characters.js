import Sequelize from 'sequelize';
import sequelize from '../util/database.js';

const Character = sequelize.define(
  'character',
  {
    charId: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
    charChinese: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    keyword: {
      type: Sequelize.STRING,
    },
    pinyin: {
      type: Sequelize.STRING,
    },
    story: {
      type: Sequelize.STRING(2500),
    },
    primitiveMeaning: {
      type: Sequelize.STRING,
    },
    explanation: {
      type: Sequelize.STRING,
    },
    notes: {
      type: Sequelize.STRING(1500),
    },
    productivePhonetic: {
      type: Sequelize.BOOLEAN,
    },
    frequency: {
      type: Sequelize.INTEGER,
    },
    illustrationAltText: {
      type: Sequelize.STRING,
    },
    constituents: {
      // Comma-separated values
      type: Sequelize.STRING,
    },
    prequel: {
      type: Sequelize.STRING,
    },
    reminder: {
      // Bool value set when it's not the first occurrence of a character.
      type: Sequelize.VIRTUAL,
    },
  },
  {
    timestamps: false,
  }
);

export default Character;
