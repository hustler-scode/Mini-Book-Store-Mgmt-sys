const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseRecord = sequelize.define('PurchaseRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  purchase_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  total_cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('Ordered', 'Received'),
    defaultValue: 'Ordered'
  },
  orderedbyid: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  orderedat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  orderremark: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  receivedat: {
    type: DataTypes.DATE,
    allowNull: true
  },
  recevedbyid: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  receiveremark: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'purchase_records',
  timestamps: true
});

module.exports = PurchaseRecord;

