import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';
const { INTEGER, STRING } = DataTypes;
import sequelize from '../util/database.js';

class Phrase extends Model<
  InferAttributes<Phrase>,
  InferCreationAttributes<Phrase>
> {
  declare phraseId: number;
  declare phraseChinese: string;
  declare phraseHungarian: string;
  declare pinyin?: string | null;
}

Phrase.init(
  {
    phraseId: {
      // unique ID in this table
      type: INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    phraseChinese: {
      type: STRING,
      allowNull: false,
    },
    phraseHungarian: {
      type: STRING,
      allowNull: false,
    },
    pinyin: {
      type: STRING,
    },
  },
  {
    sequelize,
    modelName: 'phrase',
    timestamps: false,
  }
);

export default Phrase;
