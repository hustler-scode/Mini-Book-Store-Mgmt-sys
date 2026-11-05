const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookLend = sequelize.define('BookLend', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  book_copy_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Lendedtofullname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lendedtophoneno: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lendedtoemail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  borrow_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  return_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Lend', 'Returned'),
    defaultValue: 'Lend'
  },
  lendedbyId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  lendedaat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lendedremark: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  returnedbyid: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  returnedat: {
    type: DataTypes.DATE,
    allowNull: true
  },
  returnremark: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'book_lends',
  timestamps: true
});

module.exports = BookLend;

