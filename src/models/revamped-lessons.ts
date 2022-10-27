import { DataTypes, Model, VIRTUAL } from 'sequelize';
const { INTEGER, STRING } = DataTypes;
import sequelize from '../util/database.js';

class RevampedLesson extends Model {}

RevampedLesson.init(
  {
    lessonNumber: {
      type: INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: STRING,
      allowNull: false,
    },
    prefaceTier1: {
      type: STRING(2500),
    },
    prefaceTier2: {
      type: STRING(2500),
    },
    prefaceTier3: {
      type: STRING(2500),
    },
    prefaceTier4: {
      type: STRING(2500),
    },
    status: {
      type: VIRTUAL,
    },
  },
  {
    sequelize,
    modelName: 'revampedLesson',
    timestamps: false,
  }
);

export default RevampedLesson;
