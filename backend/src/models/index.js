const sequelize = require('../config/database');
const Role = require('./Role');
const User = require('./User');
const Category = require('./Category');
const Book = require('./Book');
const BookCopy = require('./BookCopy');
const DonationRequest = require('./DonationRequest');
const Supplier = require('./Supplier');
const PurchaseRecord = require('./PurchaseRecord');
const PurchaseItem = require('./PurchaseItem');
const BookLend = require('./BookLend');
const BookFine = require('./BookFine');
const BookInLibrarySession = require('./BookInLibrarySession');

// Associations

// Role & User
Role.hasMany(User, { foreignKey: 'RoleId', as: 'users' });
User.belongsTo(Role, { foreignKey: 'RoleId', as: 'role' });

// Category & Book
Category.hasMany(Book, { foreignKey: 'category_id', as: 'books' });
Book.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Book & BookCopy
Book.hasMany(BookCopy, { foreignKey: 'book_id', as: 'copies', onDelete: 'CASCADE' });
BookCopy.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

// DonationRequest
DonationRequest.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
DonationRequest.belongsTo(User, { foreignKey: 'requestedbyid', as: 'requestedBy' });
DonationRequest.belongsTo(User, { foreignKey: 'approvedbyid', as: 'approvedBy' });
DonationRequest.belongsTo(User, { foreignKey: 'rejectedbyid', as: 'rejectedBy' });

// Supplier & PurchaseRecord & PurchaseItem
Supplier.hasMany(PurchaseRecord, { foreignKey: 'supplier_id', as: 'purchases' });
PurchaseRecord.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
PurchaseRecord.belongsTo(User, { foreignKey: 'orderedbyid', as: 'orderedBy' });
PurchaseRecord.belongsTo(User, { foreignKey: 'recevedbyid', as: 'receivedBy' });

PurchaseRecord.hasMany(PurchaseItem, { foreignKey: 'purchase_record_id', as: 'items', onDelete: 'CASCADE' });
PurchaseItem.belongsTo(PurchaseRecord, { foreignKey: 'purchase_record_id', as: 'purchaseRecord' });
PurchaseItem.belongsTo(Book, { foreignKey: 'book_id', as: 'book' });

// BookLend & BookCopy
BookCopy.hasMany(BookLend, { foreignKey: 'book_copy_id', as: 'lendings' });
BookLend.belongsTo(BookCopy, { foreignKey: 'book_copy_id', as: 'bookCopy' });
BookLend.belongsTo(User, { foreignKey: 'lendedbyId', as: 'lendedBy' });
BookLend.belongsTo(User, { foreignKey: 'returnedbyid', as: 'returnedBy' });

// BookFine & BookLend
BookLend.hasOne(BookFine, { foreignKey: 'Book_loan_id', as: 'fine' });
BookFine.belongsTo(BookLend, { foreignKey: 'Book_loan_id', as: 'loan' });
BookFine.belongsTo(User, { foreignKey: 'paidbyid', as: 'paidBy' });

// BookInLibrarySession & BookCopy
BookCopy.hasMany(BookInLibrarySession, { foreignKey: 'book_copy_id', as: 'inLibrarySessions' });
BookInLibrarySession.belongsTo(BookCopy, { foreignKey: 'book_copy_id', as: 'bookCopy' });
BookInLibrarySession.belongsTo(User, { foreignKey: 'receivedbyid', as: 'receivedBy' });
BookInLibrarySession.belongsTo(User, { foreignKey: 'returnedbyid', as: 'returnedBy' });

// Seeder function to auto-populate basic roles and categories
const seedDefaults = async () => {
  try {
    const roleCount = await Role.count();
    if (roleCount === 0) {
      await Role.bulkCreate([
        { Rolename: 'Admin', IsAdmin: true },
        { Rolename: 'Staff', IsAdmin: false },
        { Rolename: 'Member', IsAdmin: false },
        { Rolename: 'Visitor', IsAdmin: false }
      ]);
      console.log('Default roles seeded successfully');
    }

    const catCount = await Category.count();
    if (catCount === 0) {
      await Category.bulkCreate([
        { name: 'Fiction', description: 'Novels, storytelling and imaginative literature' },
        { name: 'Science', description: 'Scientific disciplines, physics, biology, and research' },
        { name: 'History', description: 'World history, civilizations, and biographies' },
        { name: 'Technology', description: 'Computing, software engineering, and electronics' },
        { name: 'Philosophy', description: 'Philosophy, ethics, and logic' },
        { name: 'Children', description: 'Children and young adult literature' }
      ]);
      console.log('Default categories seeded successfully');
    }

    // Create an initial admin user if no users exist
    const userCount = await User.count();
    if (userCount === 0) {
      const adminRole = await Role.findOne({ where: { Rolename: 'Admin' } });
      await User.create({
        name: 'System Admin',
        email: 'admin@library.com',
        password: 'AdminPassword123!',
        phone_number: '+1-555-0100',
        isstaff: true,
        isvisitor: false,
        status: 'Active',
        RoleId: adminRole ? adminRole.id : null
      });
      console.log('Default admin user seeded: admin@library.com / AdminPassword123!');
    }
  } catch (error) {
    console.error('Error during default seeding:', error.message);
  }
};

module.exports = {
  sequelize,
  Role,
  User,
  Category,
  Book,
  BookCopy,
  DonationRequest,
  Supplier,
  PurchaseRecord,
  PurchaseItem,
  BookLend,
  BookFine,
  BookInLibrarySession,
  seedDefaults
};

