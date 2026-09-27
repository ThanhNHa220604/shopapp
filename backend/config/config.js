require('dotenv').config()
module.exports = {
  development: {
    username: process.env.DB_DEV_USERNAME,
    password: process.env.DB_DEV_PASSWORD || null,
    database: process.env.DB_DEV_DATABASE,
    port: parseInt(process.env.DB_DEV_PORT, 10),
    host: process.env.DB_DEV_HOST,
    dialect: process.env.DB_DEV_DIALECT,
  },
};
