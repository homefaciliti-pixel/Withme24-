require('dotenv').config();

const getPassword = () => {
  if (process.env.DB_PASSWORD !== undefined && process.env.DB_PASSWORD !== '') {
    return process.env.DB_PASSWORD;
  }
  if (process.env.MYSQL_PASSWORD !== undefined && process.env.MYSQL_PASSWORD !== '') {
    return process.env.MYSQL_PASSWORD;
  }
  return null;
};

module.exports = {
  development: {
    username: process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: getPassword(),
    database: process.env.DB_NAME || process.env.MYSQL_DB || process.env.MYSQL_DATABASE || 'withme24',
    host: process.env.DB_HOST || process.env.MYSQL_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306', 10),
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  },
  test: {
    username: process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: getPassword(),
    database: process.env.DB_NAME || process.env.MYSQL_DB || 'withme24_test',
    host: process.env.DB_HOST || process.env.MYSQL_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306', 10),
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  },
  production: {
    username: process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: getPassword(),
    database: process.env.DB_NAME || process.env.MYSQL_DB || process.env.MYSQL_DATABASE || 'withme24',
    host: process.env.DB_HOST || process.env.MYSQL_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306', 10),
    dialect: 'mysql',
    dialectOptions: process.env.DB_SSL === 'true' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {},
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  }
};
