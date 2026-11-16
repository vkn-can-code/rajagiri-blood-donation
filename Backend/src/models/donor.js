'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Donor extends Model {
    static associate(models) {
      Donor.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  Donor.init({
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    blood_group: DataTypes.STRING,
    date_of_birth: DataTypes.DATEONLY,
    last_donation_date: DataTypes.DATEONLY,
    is_available: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Donor',
  });
  return Donor;
};
