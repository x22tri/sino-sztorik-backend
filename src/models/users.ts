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
import { INVALID_NUMBERS_PROVIDED } from '../util/string-literals.js';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare userId: CreationOptional<number>;
  declare displayName: string;
  declare email: string;
  declare password: string;
  declare currentTier: number;
  declare currentLesson: number;

  getProgress(): Progress {
    return {
      tier: this.currentTier,
      lessonNumber: this.currentLesson,
    };
  }

  comesLaterThan(secondState: Progress) {
    const firstState = this.getProgress();

    if (
      (firstState.indexInLesson &&
        !Number.isInteger(firstState.indexInLesson)) ||
      (secondState.indexInLesson &&
        !Number.isInteger(secondState.indexInLesson))
    ) {
      throw new Error(INVALID_NUMBERS_PROVIDED);
    }

    if (firstState.tier > secondState.tier) {
      return true;
    }

    if (
      firstState.tier === secondState.tier &&
      firstState.lessonNumber > secondState.lessonNumber
    ) {
      return true;
    }

    if (
      firstState.tier === secondState.tier &&
      firstState.lessonNumber === secondState.lessonNumber &&
      firstState.indexInLesson &&
      secondState.indexInLesson &&
      firstState.indexInLesson > secondState.indexInLesson
    ) {
      return true;
    }

    return false;
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
