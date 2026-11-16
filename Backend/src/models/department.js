'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Department extends Model {
        static associate(models) {
            // Department has one Head Faculty
            Department.belongsTo(models.User, {
                foreignKey: 'head_faculty_id',
                as: 'HeadFaculty'
            });
            // Department has many Batches
            Department.hasMany(models.Batch, {
                foreignKey: 'department_id',
                as: 'Batches'
            });
        }
    }
    Department.init({
        name: { type: DataTypes.STRING, allowNull: false, unique: true },
        head_faculty_id: {
            type: DataTypes.INTEGER,
            references: { model: 'Users', key: 'id' }
        }
    }, {
        sequelize,
        modelName: 'Department',
    });
    return Department;
};
