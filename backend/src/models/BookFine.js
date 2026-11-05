const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookFine = sequelize.define('BookFine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Book_loan_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('Unpaid', 'Paid'),
    defaultValue: 'Unpaid'
  },
  paidbyid: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  paidat: {
    type: DataTypes.DATE,
    allowNull: true
  },
  paidremark: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'book_fines',
  timestamps: true
});

module.exports = BookFine;

