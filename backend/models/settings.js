'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class settings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  settings.init({
    theme: DataTypes.STRING,
    accent_color: DataTypes.STRING,
    language: DataTypes.STRING,
    sidebar_collapsed: DataTypes.BOOLEAN,
    store_name: DataTypes.STRING,
    hotline: DataTypes.STRING,
    contact_email: DataTypes.STRING,
    maintenance_mode: DataTypes.BOOLEAN,
    shipping_fee: DataTypes.INTEGER,
    free_shipping_threshold: DataTypes.INTEGER,
    order_sound_enabled: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'settings',
  });
  return settings;
};