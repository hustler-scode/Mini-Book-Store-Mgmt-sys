const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Rolename: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  IsAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'roles',
  timestamps: true
});

module.exports = Role;

