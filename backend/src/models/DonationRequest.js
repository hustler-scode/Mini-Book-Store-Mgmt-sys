const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DonationRequest = sequelize.define('DonationRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  donor_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  donor_email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  donor_phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  book_title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  condition: {
    type: DataTypes.ENUM('New', 'Good', 'Fair', 'Poor', 'Damaged'),
    defaultValue: 'Good'
  },
  status: {
    type: DataTypes.ENUM('requested', 'Approved', 'Rejected'),
    defaultValue: 'requested'
  },
  requestedbyid: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  requestedat: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  requestremark: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approvedbyid: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  approvedat: {
    type: DataTypes.DATE,
    allowNull: true
  },
  approvalremark: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rejectedbyid: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rejectedat: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejectremark: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'donation_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DonationRequest;

