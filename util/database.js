import Sequelize from 'sequelize';
import { config } from 'dotenv';
config();

const database = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || undefined,
    dialect: 'mysql',
    logging: false,
    pool: { max: 3 },
  }
);

export default database;
