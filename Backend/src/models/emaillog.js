'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmailLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EmailLog.init({
    recipient_email: DataTypes.STRING,
    subject: DataTypes.STRING,
    body_html: DataTypes.TEXT,
    status: DataTypes.STRING,
    scheduled_at: DataTypes.DATE,
    sent_at: DataTypes.DATE,
    error_message: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'EmailLog',
  });
  return EmailLog;
};