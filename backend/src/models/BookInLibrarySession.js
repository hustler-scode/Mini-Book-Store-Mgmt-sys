const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookInLibrarySession = sequelize.define('BookInLibrarySession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  book_copy_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_fullname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  receivedbyid: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  receivedat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  receiveremark: {
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
  },
  checkout_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  expected_return_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  actual_return_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Received', 'Returned', 'Desk_Overdue'),
    defaultValue: 'Received'
  }
}, {
  tableName: 'book_in_library_sessions',
  timestamps: true
});

module.exports = BookInLibrarySession;

