import Sequelize from 'sequelize';
import sequelize from '../util/database.js';

const User = sequelize.define('user', {
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  displayName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  currentTier: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  currentLesson: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

export default User;
