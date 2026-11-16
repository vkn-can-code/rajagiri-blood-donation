'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Batch, { foreignKey: 'batch_id', as: 'StudentBatch' });
      User.hasMany(models.Department, { foreignKey: 'head_faculty_id', as: 'HeadedDepartments' });
      User.hasMany(models.Donation, { foreignKey: 'user_id' });
      User.hasMany(models.BloodRequest, { foreignKey: 'requester_id' });
      User.hasMany(models.RequestResponse, { foreignKey: 'responder_id' });
      User.hasMany(models.Notification, { foreignKey: 'user_id' });
      User.hasMany(models.CampRegistration, { foreignKey: 'user_id' });
    }
  }
  User.init({
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    phone_number: { type: DataTypes.STRING, allowNull: true, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM('student', 'faculty', 'faculty_admin', 'volunteer', 'non_teaching', 'admin', 'super_admin'),
      allowNull: false
    },
    batch_id: { type: DataTypes.INTEGER, references: { model: 'Batches', key: 'id' } },
    blood_group: { type: DataTypes.STRING(5), allowNull: true },

    // --- NEW FIELDS RLYFE 2.0 ---
    height: { type: DataTypes.FLOAT, allowNull: true },
    weight: { type: DataTypes.FLOAT, allowNull: true }, // in kg
    gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: true },
    student_id: { type: DataTypes.STRING, allowNull: true }, // "student's own number"
    address: { type: DataTypes.TEXT, allowNull: true },
    has_donated: { type: DataTypes.BOOLEAN, defaultValue: false },
    last_donation_date: { type: DataTypes.DATEONLY, allowNull: true },
    badges: { type: DataTypes.JSON, defaultValue: [] }, // Array of strings like ["Hero 2024"]
    // ----------------------------

    permissions: { type: DataTypes.JSON, defaultValue: {} },
    is_first_login: { type: DataTypes.BOOLEAN, defaultValue: true },
    reset_token: { type: DataTypes.STRING, allowNull: true },
    reset_token_expires: { type: DataTypes.DATE, allowNull: true }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      // 1. Hash on Create
      beforeCreate: async (user) => {
        if (user.password_hash) {
          const salt = await bcrypt.genSalt(10);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      },
      // 2. Hash on Update (Critical for Edit User feature)
      beforeUpdate: async (user) => {
        if (user.changed('password_hash')) {
          const salt = await bcrypt.genSalt(10);
          user.password_hash = await bcrypt.hash(user.password_hash, salt);
        }
      }
    }
  });
  return User;
};