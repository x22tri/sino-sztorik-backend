import { DataTypes, Model, VIRTUAL } from 'sequelize';
const { INTEGER, STRING } = DataTypes;
import sequelize from '../util/database.js';

class Lesson extends Model {
  declare lessonNumber: number;
  declare name: string;
  declare prefaceTier1?: string | null;
  declare prefaceTier2?: string | null;
  declare prefaceTier3?: string | null;
  declare prefaceTier4?: string | null;
  declare status?: string;
}

Lesson.init(
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
    modelName: 'Lesson',
    timestamps: false,
  }
);

export default Lesson;
