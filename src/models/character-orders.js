import Sequelize from 'sequelize';
import sequelize from '../util/database.js';
import Character from './characters.js';

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

export default CharacterOrder;
