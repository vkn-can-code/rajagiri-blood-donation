'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Donation extends Model {
    static associate(models) {
      Donation.belongsTo(models.User, { foreignKey: 'user_id' });
      Donation.belongsTo(models.Camp, { foreignKey: 'camp_id' });
      Donation.belongsTo(models.BloodRequest, { foreignKey: 'blood_request_id', allowNull: true });
    }
  }
  Donation.init({
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
    camp_id: { type: DataTypes.INTEGER, allowNull: true },
    donation_date: { type: DataTypes.DATEONLY, allowNull: false },
    certificate_url: { type: DataTypes.STRING, allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    // --- NEW FIELDS ---
    description: { type: DataTypes.TEXT, allowNull: true },
    rejection_reason: { type: DataTypes.TEXT, allowNull: true },
    blood_request_id: { type: DataTypes.INTEGER, references: { model: 'BloodRequests', key: 'id' }, allowNull: true }
    // ------------------
  }, {
    sequelize,
    modelName: 'Donation',
  });
  return Donation;
};