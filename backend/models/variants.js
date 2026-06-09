'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class variants extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
       variants.hasMany(models.variant_values, {
         foreignKey: "variant_id",
       });
    }
  }
  variants.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'variants',
  });
  return variants;
};