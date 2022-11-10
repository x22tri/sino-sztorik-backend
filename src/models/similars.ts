import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
const { INTEGER, STRING, ENUM, BOOLEAN } = DataTypes;

import sequelize from '../util/database.js';
import { SimilarType } from '../util/enums.js';

class Similar extends Model<
  InferAttributes<Similar>,
  InferCreationAttributes<Similar>
> {
  declare similarId: number;
  declare similarGroup: number;
  declare charChinese: string;
  declare similarType: SimilarType;
  declare similarToPrimitiveMeaning?: boolean | null;
}

Similar.init(
  {
    similarId: {
      // unique ID in this table
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    similarGroup: {
      // characters that belong together
      type: INTEGER,
      allowNull: false,
    },
    charChinese: {
      type: STRING,
      allowNull: false,
    },
    similarType: {
      type: ENUM('appearance', 'meaning'),
      allowNull: false,
    },
    similarToPrimitiveMeaning: {
      // is it the primitive meaning that is similar to the others? ("meaning" only)
      type: BOOLEAN,
    },
  },
  {
    sequelize,
    modelName: 'similar',
    timestamps: false,
  }
);

export default Similar;
