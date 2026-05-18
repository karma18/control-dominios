const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '.env'),
  quiet: true,
});

const migrationsDirectory = path.join(
  __dirname,
  'src',
  'infrastructure',
  'database',
  'migrations',
);

const seedsDirectory = path.join(
  __dirname,
  'src',
  'infrastructure',
  'database',
  'seeders',
);

const baseConnection = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'control_dominios',
  timezone: 'Z',
};

module.exports = {
  development: {
    client: 'mysql2',
    connection: baseConnection,
    migrations: {
      directory: migrationsDirectory,
      extension: 'js',
    },
    seeds: {
      directory: seedsDirectory,
      extension: 'js',
    },
  },
  test: {
    client: 'mysql2',
    connection: {
      ...baseConnection,
      database: process.env.DB_TEST_NAME || 'control_dominios_test',
    },
    migrations: {
      directory: migrationsDirectory,
      extension: 'js',
    },
    seeds: {
      directory: seedsDirectory,
      extension: 'js',
    },
  },
  production: {
    client: 'mysql2',
    connection: baseConnection,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: migrationsDirectory,
      extension: 'js',
    },
    seeds: {
      directory: seedsDirectory,
      extension: 'js',
    },
  },
};
