import {
  DataTypes,
  FindOptions,
  Includeable,
  InferAttributes,
  InferCreationAttributes,
  Model,
  ModelStatic,
  ModelType,
} from 'sequelize';
const { INTEGER, STRING, FLOAT } = DataTypes;

import sequelize from '../util/database.js';
import Character from './characters.js';
import { findAllAndHoist } from '../util/functions/findAllAndHoist.js';
import { Progress, FindOptionsSingleInclude } from '../util/interfaces.js';
import { HasProgress } from '../util/classes/HasProgress.js';

class CharacterOrder extends Model<
  InferAttributes<CharacterOrder>,
  InferCreationAttributes<CharacterOrder>
> {
  declare orderId: number;
  declare charId: string;
  declare tier: number;
  declare lessonNumber: number;
  declare indexInLesson: number;

  getProgress: () => Progress;
  comesLaterThan: (secondState: Progress) => boolean;

  constructor(...args: any[]) {
    super(...args);

    const { comesLaterThan, getProgress } = new HasProgress(this);
    this.comesLaterThan = comesLaterThan;
    this.getProgress = getProgress;
  }

  static async findAllAndHoist<I extends Model>(
    query: FindOptionsSingleInclude<I>
  ) {
    return await findAllAndHoist(this, query);
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
