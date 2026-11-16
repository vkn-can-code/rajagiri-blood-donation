'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CampRegistration extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CampRegistration.belongsTo(models.User, { foreignKey: 'user_id' });
      CampRegistration.belongsTo(models.Camp, { foreignKey: 'camp_id' });
    }
  }
  CampRegistration.init({
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
    camp_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Camps', key: 'id' } },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'auto_rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    weight_over_45: DataTypes.BOOLEAN,
    already_donated: DataTypes.BOOLEAN,
    major_surgery: DataTypes.BOOLEAN,
    on_medication: DataTypes.BOOLEAN,
    tattoo_piercing: DataTypes.BOOLEAN,
    consumed_alcohol: DataTypes.BOOLEAN,
    dental_work: DataTypes.BOOLEAN,
    pregnant_breastfeeding: DataTypes.BOOLEAN,
    history_disease: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'CampRegistration',
  });
  return CampRegistration;
};