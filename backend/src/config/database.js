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
    username: process.env.MYSQL_USER || process.env.REMOTE_DB_USER || process.env.DB_USER || 'root',
    password: process.env.MYSQL_PASSWORD !== undefined ? process.env.MYSQL_PASSWORD : (process.env.REMOTE_DB_PASSWORD !== undefined ? process.env.REMOTE_DB_PASSWORD : getPassword()),
    database: process.env.MYSQL_DATABASE || process.env.REMOTE_DB_NAME || process.env.DB_NAME || 'withme24',
    host: process.env.MYSQL_HOST || process.env.REMOTE_DB_HOST || process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || process.env.REMOTE_DB_PORT || process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  },
  test: {
    username: process.env.MYSQL_USER || process.env.DB_USER || 'root',
    password: getPassword(),
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'withme24_test',
    host: process.env.MYSQL_HOST || process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306', 10),
    dialect: 'mysql',
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  },
  production: {
    username: process.env.MYSQL_USER || process.env.REMOTE_DB_USER || process.env.DB_USER || 'root',
    password: process.env.MYSQL_PASSWORD !== undefined ? process.env.MYSQL_PASSWORD : (process.env.REMOTE_DB_PASSWORD !== undefined ? process.env.REMOTE_DB_PASSWORD : getPassword()),
    database: process.env.MYSQL_DATABASE || process.env.REMOTE_DB_NAME || process.env.DB_NAME || 'withme24',
    host: process.env.MYSQL_HOST || process.env.REMOTE_DB_HOST || process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || process.env.REMOTE_DB_PORT || process.env.DB_PORT || '3306', 10),
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
