import { Sequelize } from 'sequelize';

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST } = process.env;

if (DB_NAME === undefined || DB_USER === undefined) {
  throw new Error('Environment variables could not be read.');
}

const database = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST || undefined,
  dialect: 'mysql',
  logging: false,
  pool: { max: 3 },
});

export default database;
