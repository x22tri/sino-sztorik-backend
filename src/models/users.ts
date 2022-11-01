import {
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
const { INTEGER, STRING } = DataTypes;

import sequelize from '../util/database.js';
import { Progress } from '../util/interfaces.js';
import { HasProgress } from '../util/classes/HasProgress.js';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare userId: CreationOptional<number>;
  declare displayName: string;
  declare email: string;
  declare password: string;
  declare currentTier: number;
  declare currentLesson: number;

  getProgress: () => Progress;
  comesLaterThan: (secondState: Progress) => boolean;

  constructor(...args: any[]) {
    super(...args);

    const progressMethods = new HasProgress({
      tier: this.currentTier,
      lessonNumber: this.currentLesson,
    });

    this.comesLaterThan = progressMethods.comesLaterThan;
    this.getProgress = () => progressMethods.getProgress();
  }
}

User.init(
  {
    userId: {
      type: INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    displayName: {
      type: STRING,
      allowNull: false,
    },
    email: {
      type: STRING,
      allowNull: false,
    },
    password: {
      type: STRING,
      allowNull: false,
    },
    currentTier: {
      type: INTEGER,
      allowNull: false,
    },
    currentLesson: {
      type: INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'user',
    timestamps: false,
  }
);

export default User;
