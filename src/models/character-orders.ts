import { Sequelize, DataTypes } from 'sequelize';
const { INTEGER, STRING, BOOLEAN, FLOAT } = DataTypes;

import sequelize from '../util/database.js';
import Character from './characters.js';

const CharacterOrder = sequelize.define(
  'characterOrder',
  {
    orderId: {
      type: FLOAT,
      allowNull: false,
      primaryKey: true,
    },
    charId: {
      type: STRING,
      allowNull: false,
      references: {
        model: Character,
        key: 'charId',
      },
    },
    tier: {
      type: INTEGER,
      allowNull: false,
    },
    lessonNumber: {
      type: INTEGER,
      allowNull: false,
    },
    indexInLesson: {
      type: INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

export default CharacterOrder;
