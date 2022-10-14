import Sequelize from 'sequelize';
import sequelize from '../util/database.js';

const RevampedLesson = sequelize.define(
  'revampedLesson',
  {
    lessonNumber: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    prefaceTier1: {
      type: Sequelize.STRING(2500),
    },
    prefaceTier2: {
      type: Sequelize.STRING(2500),
    },
    prefaceTier3: {
      type: Sequelize.STRING(2500),
    },
    prefaceTier4: {
      type: Sequelize.STRING(2500),
    },
  },
  {
    timestamps: false,
  }
);

export default RevampedLesson;
