const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseItem = sequelize.define('PurchaseItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  purchase_record_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isbn: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  }
}, {
  tableName: 'purchase_items',
  timestamps: true
});

module.exports = PurchaseItem;

