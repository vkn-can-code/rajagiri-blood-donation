'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Camp extends Model {
    static associate(models) {
      Camp.hasMany(models.Donation, { foreignKey: 'camp_id' });
      Camp.hasMany(models.CampRegistration, { foreignKey: 'camp_id' });
    }
  }
  Camp.init({
    title: DataTypes.STRING,
    location: DataTypes.TEXT,
    address: DataTypes.TEXT,
    camp_date: DataTypes.DATE,
    
    // --- NEW FIELDS ---
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    google_maps_link: DataTypes.TEXT
    // --- END NEW ---

  }, {
    sequelize,
    modelName: 'Camp',
  });
  return Camp;
};