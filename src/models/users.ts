import {
  Sequelize,
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
const { INTEGER, STRING } = DataTypes;

import sequelize from '../util/database.js';

interface UserModel
  extends Model<
    InferAttributes<UserModel>,
    InferCreationAttributes<UserModel>
  > {
  userId: CreationOptional<number>;
  displayName: string;
  email: string;
  password: string;
  currentTier: number;
  currentLesson: number;
}

const User = sequelize.define<UserModel>('user', {
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
});

export default User;
