'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BloodRequest extends Model {
    static associate(models) {
      // A BloodRequest belongs to one User (the requester)
      BloodRequest.belongsTo(models.User, { foreignKey: 'requester_id', as: 'Requester' });
      // A BloodRequest can have many Responses
      BloodRequest.hasMany(models.RequestResponse, { foreignKey: 'request_id' });
    }
  }
  BloodRequest.init({
    requester_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
    patient_name: { type: DataTypes.STRING, allowNull: false },
    hospital_name: { type: DataTypes.STRING, allowNull: false },
    required_blood_group: { type: DataTypes.STRING(3), allowNull: false },
    units_required: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM('open', 'fulfilled', 'closed'),
      allowNull: false,
      defaultValue: 'open'
    },
    // Extended fields for hospital-grade requests
    patient_age: { type: DataTypes.INTEGER, allowNull: true },
    patient_id: { type: DataTypes.STRING, allowNull: true },
    reason: { type: DataTypes.TEXT, allowNull: true },
    bystander_name: { type: DataTypes.STRING, allowNull: true },
    bystander_number: { type: DataTypes.STRING, allowNull: true },
    required_date: { type: DataTypes.DATEONLY, allowNull: true },

    // --- NEW FIELDS (From Map Integration) ---
    google_maps_link: { type: DataTypes.STRING, allowNull: true }

  }, {
    sequelize,
    modelName: 'BloodRequest',
  });
  return BloodRequest;
};