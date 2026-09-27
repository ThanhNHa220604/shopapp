"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class banners extends Model {
    static associate(models) {
      // 👉 ĐÃ SỬA: Bảo vệ mối quan hệ phòng trường hợp model con chưa kịp khởi tạo
      if (models.bannerdetail) {
        banners.hasMany(models.bannerdetail, {
          foreignKey: "banner_id",
        });
      }
    }
  }

  banners.init(
    {
      name: DataTypes.STRING,
      image: DataTypes.STRING,
      status: DataTypes.INTEGER,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      start_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "banners",
      tableName: "banners",
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return banners;
};
