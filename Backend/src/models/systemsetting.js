'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SystemSetting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SystemSetting.init({
    key: { type: DataTypes.STRING, unique: true, allowNull: false },
    value: DataTypes.TEXT,
    type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'SystemSetting',
  });
  return SystemSetting;
};