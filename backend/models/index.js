"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    try {
      const modelImport = require(path.join(__dirname, file));

      // Hỗ trợ cả ES Modules (export default) và CommonJS (module.exports)
      const modelFunction = modelImport.default || modelImport;

      if (typeof modelFunction === "function") {
        const model = modelFunction(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
      } else {
        // In ra cảnh báo nếu file không đúng định dạng model chuẩn
        console.warn(
          `⚠️ Cảnh báo Sequelize: File "${file}" không export đúng function nên đã bị bỏ qua.`,
        );
      }
    } catch (error) {
      // In ra chi tiết lỗi của file đó để bạn dễ dàng sửa code
      console.error(
        `❌ Lỗi nghiêm trọng khi nạp file model "${file}":`,
        error.message,
      );
    }
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
