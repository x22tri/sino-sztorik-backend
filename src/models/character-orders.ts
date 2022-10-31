import {
  DataTypes,
  FindOptions,
  InferAttributes,
  InferCreationAttributes,
  Model,
  ModelStatic,
} from 'sequelize';
const { INTEGER, STRING, FLOAT } = DataTypes;

import sequelize from '../util/database.js';
import Character from './characters.js';
import { findAllAndHoist } from '../util/methods/findAllAndHoist.js';
import { Progress, HasProgress } from '../util/interfaces.js';
import { INVALID_NUMBERS_PROVIDED } from '../util/string-literals.js';

class CharacterOrder extends Model<
  InferAttributes<CharacterOrder>,
  InferCreationAttributes<CharacterOrder>
> {
  declare orderId: number;
  declare charId: string;
  declare tier: number;
  declare lessonNumber: number;
  declare indexInLesson: number;

  static async findAllAndHoist(query: FindOptions) {
    return await findAllAndHoist<CharacterOrder, Character>(this, query);
  }

  getProgress(): Progress {
    return {
      tier: this.tier,
      lessonNumber: this.lessonNumber,
      indexInLesson: this.indexInLesson,
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

CharacterOrder.init(
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
    sequelize,
    modelName: 'characterOrder',
    timestamps: false,
  }
);

export { CharacterOrder };
