const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookCopy = sequelize.define('BookCopy', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  copy_number: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  condition: {
    type: DataTypes.ENUM('New', 'Good', 'Fair', 'Poor', 'Damaged'),
    defaultValue: 'Good'
  },
  source_type: {
    type: DataTypes.ENUM('Donation', 'Purchase'),
    defaultValue: 'Purchase'
  },
  status: {
    type: DataTypes.ENUM('Available', 'Checked_Out_Home', 'In_Library_Use', 'Maintenance'),
    defaultValue: 'Available'
  }
}, {
  tableName: 'book_copies',
  timestamps: true
});

module.exports = BookCopy;

