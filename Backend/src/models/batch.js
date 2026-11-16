'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Batch extends Model {
    static associate(models) {
      // A Batch belongs to a Department
      Batch.belongsTo(models.Department, {
        foreignKey: 'department_id',
        as: 'Department'
      });
      // A Batch has many Students (which are Users)
      Batch.hasMany(models.User, {
        foreignKey: 'batch_id',
        as: 'Students'
      });
      // A Batch belongs to a Class Tutor (User)
      Batch.belongsTo(models.User, {
        foreignKey: 'class_tutor_id',
        as: 'ClassTutor'
      });
    }
  }
  Batch.init({
    batch_name: { type: DataTypes.STRING, allowNull: false, unique: true },
    department_id: { type: DataTypes.INTEGER, references: { model: 'Departments', key: 'id' } },
    class_tutor_id: { type: DataTypes.INTEGER, references: { model: 'Users', key: 'id' } }
  }, {
    sequelize,
    modelName: 'Batch',
  });
  return Batch;
};