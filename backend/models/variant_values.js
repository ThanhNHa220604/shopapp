'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class variant_values extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    variant_values.belongsTo(models.variants, {
      foreignKey: "variant_id",
    });
    }
  }
  variant_values.init(
    {
      variant_id: DataTypes.INTEGER,
      image: DataTypes.STRING,
      value: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "variant_values",
      tableName: "variant_values",
      timestamps: true, // 👈 Đảm bảo bật timestamps
      underscored: true, // 👈 Đảm bảo bật underscored
      createdAt: "created_at", // 👈 Ép Sequelize chuyển createdAt thành created_at
      updatedAt: "updated_at",
    },
  );
  return variant_values;
};