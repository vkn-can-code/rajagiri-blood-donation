'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RequestResponse extends Model {
    static associate(models) {
      // A Response belongs to one BloodRequest
      RequestResponse.belongsTo(models.BloodRequest, { foreignKey: 'request_id' });
      // A Response belongs to one User (the responder)
      RequestResponse.belongsTo(models.User, { foreignKey: 'responder_id' });
    }
  }
  RequestResponse.init({
    request_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'BloodRequests', key: 'id' } },
    responder_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
    message: DataTypes.TEXT,
    contact_details: DataTypes.STRING,
    reason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'new',
      validate: {
        isIn: [['new', 'contacted', 'accepted', 'rejected']]
      }
    }
  }, {
    sequelize,
    modelName: 'RequestResponse',
  });
  return RequestResponse;
};