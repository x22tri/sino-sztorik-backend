const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const Character = require('./characters');

const CharacterOrder = sequelize.define(
  'characterOrder',
  {
    orderId: {
      type: Sequelize.FLOAT,
      allowNull: false,
      primaryKey: true,
    },
    charId: {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: Character,
        key: 'charId',
      },
    },
    tier: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    lessonNumber: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    indexInLesson: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    raw: true,
  }
);

module.exports = CharacterOrder;
