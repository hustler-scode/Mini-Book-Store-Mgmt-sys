require('dotenv').config();
const {
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
  BookInLibrarySession
} = require('../models');

const seedSampleData = async () => {
  console.log('--- Seeding Comprehensive Sample Data For All Tables ---');

  try {
    // 1. Roles
    console.log('Seeding Roles...');
    let [adminRole] = await Role.findOrCreate({
      where: { Rolename: 'Admin' },
      defaults: { Rolename: 'Admin', IsAdmin: true }
    });
    let [staffRole] = await Role.findOrCreate({
      where: { Rolename: 'Staff' },
      defaults: { Rolename: 'Staff', IsAdmin: false }
    });
    let [memberRole] = await Role.findOrCreate({
      where: { Rolename: 'Member' },
      defaults: { Rolename: 'Member', IsAdmin: false }
    });
    let [visitorRole] = await Role.findOrCreate({
      where: { Rolename: 'Visitor' },
      defaults: { Rolename: 'Visitor', IsAdmin: false }
    });

    // 2. Users (Admin, Staff, Members, Visitors)
    console.log('Seeding Users...');
    let [adminUser] = await User.findOrCreate({
      where: { email: 'admin@library.com' },
      defaults: {
        name: 'System Admin',
        email: 'admin@library.com',
        password: 'AdminPassword123!',
        phone_number: '+1-555-0100',
        isstaff: true,
        isvisitor: false,
        status: 'Active',
        RoleId: adminRole.id
      }
    });

    let [librarianStaff] = await User.findOrCreate({
      where: { email: 'sarah.librarian@library.com' },
      defaults: {
        name: 'Sarah Jenkins',
        email: 'sarah.librarian@library.com',
        password: 'StaffPassword123!',
        phone_number: '+1-555-0101',
        isstaff: true,
        isvisitor: false,
        status: 'Active',
        RoleId: staffRole.id
      }
    });

    let [assistantStaff] = await User.findOrCreate({
      where: { email: 'michael.desk@library.com' },
      defaults: {
        name: 'Michael Chang',
        email: 'michael.desk@library.com',
        password: 'StaffPassword123!',
        phone_number: '+1-555-0102',
        isstaff: true,
        isvisitor: false,
        status: 'Active',
        RoleId: staffRole.id
      }
    });

    let [memberOne] = await User.findOrCreate({
      where: { email: 'alice.johnson@gmail.com' },
      defaults: {
        name: 'Alice Johnson',
        email: 'alice.johnson@gmail.com',
        password: 'MemberPassword123!',
        phone_number: '+1-555-0201',
        isstaff: false,
        isvisitor: false,
        status: 'Active',
        RoleId: memberRole.id
      }
    });

    let [memberTwo] = await User.findOrCreate({
      where: { email: 'david.smith@yahoo.com' },
      defaults: {
        name: 'David Smith',
        email: 'david.smith@yahoo.com',
        password: 'MemberPassword123!',
        phone_number: '+1-555-0202',
        isstaff: false,
        isvisitor: false,
        status: 'Active',
        RoleId: memberRole.id
      }
    });

    let [visitorOne] = await User.findOrCreate({
      where: { email: 'emily.visitor@outlook.com' },
      defaults: {
        name: 'Emily Davis',
        email: 'emily.visitor@outlook.com',
        password: 'VisitorPassword123!',
        phone_number: '+1-555-0301',
        isstaff: false,
        isvisitor: true,
        status: 'Active',
        RoleId: visitorRole.id
      }
    });

    // 3. Categories
    console.log('Seeding Categories...');
    const categoriesData = [
      { name: 'Computer Science & Technology', description: 'Software engineering, algorithms, AI, and systems.' },
      { name: 'Classic Literature & Fiction', description: 'Time-honored classics, novels, and contemporary storytelling.' },
      { name: 'Science & Physics', description: 'Astronomy, cosmology, quantum theory, and chemistry.' },
      { name: 'World History & Biography', description: 'Historical civilizations, world events, and prominent figures.' },
      { name: 'Philosophy & Ethics', description: 'Logic, existentialism, moral philosophy, and critical thinking.' },
      { name: 'Children & Young Adult', description: 'Early readers, folklore, adventure, and educational youth books.' }
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      const [record] = await Category.findOrCreate({
        where: { name: cat.name },
        defaults: cat
      });
      categoryMap[cat.name] = record;
    }

    // 4. Books
    console.log('Seeding Books...');
    const booksData = [
      {
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        isbn: '978-0132350884',
        category_id: categoryMap['Computer Science & Technology'].id
      },
      {
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        isbn: '978-1449373320',
        category_id: categoryMap['Computer Science & Technology'].id
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '978-0060935467',
        category_id: categoryMap['Classic Literature & Fiction'].id
      },
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '978-0743273565',
        category_id: categoryMap['Classic Literature & Fiction'].id
      },
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        isbn: '978-0553380163',
        category_id: categoryMap['Science & Physics'].id
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        isbn: '978-0062316097',
        category_id: categoryMap['World History & Biography'].id
      },
      {
        title: 'Meditations',
        author: 'Marcus Aurelius',
        isbn: '978-0812968255',
        category_id: categoryMap['Philosophy & Ethics'].id
      },
      {
        title: 'The Little Prince',
        author: 'Antoine de Saint-Exupéry',
        isbn: '978-0156012195',
        category_id: categoryMap['Children & Young Adult'].id
      }
    ];

    const bookMap = {};
    for (const b of booksData) {
      const [bookRecord] = await Book.findOrCreate({
        where: { isbn: b.isbn },
        defaults: b
      });
      bookMap[b.title] = bookRecord;
    }

    // 5. Book Copies (Physical Inventory with diverse statuses and conditions)
    console.log('Seeding Book Copies...');
    const copiesData = [
      // Clean Code copies
      {
        book_id: bookMap['Clean Code: A Handbook of Agile Software Craftsmanship'].id,
        copy_number: 'BC-CC-001',
        condition: 'Good',
        source_type: 'Purchase',
        status: 'Available'
      },
      {
        book_id: bookMap['Clean Code: A Handbook of Agile Software Craftsmanship'].id,
        copy_number: 'BC-CC-002',
        condition: 'New',
        source_type: 'Purchase',
        status: 'Checked_Out_Home' // currently borrowed by Alice
      },
      {
        book_id: bookMap['Clean Code: A Handbook of Agile Software Craftsmanship'].id,
        copy_number: 'BC-CC-003',
        condition: 'Fair',
        source_type: 'Donation',
        status: 'Available'
      },
      // Designing Data-Intensive Applications
      {
        book_id: bookMap['Designing Data-Intensive Applications'].id,
        copy_number: 'BC-DDIA-001',
        condition: 'New',
        source_type: 'Purchase',
        status: 'In_Library_Use' // being read in library desk
      },
      {
        book_id: bookMap['Designing Data-Intensive Applications'].id,
        copy_number: 'BC-DDIA-002',
        condition: 'New',
        source_type: 'Purchase',
        status: 'Available'
      },
      // To Kill a Mockingbird
      {
        book_id: bookMap['To Kill a Mockingbird'].id,
        copy_number: 'BC-TKM-001',
        condition: 'Good',
        source_type: 'Donation',
        status: 'Available'
      },
      {
        book_id: bookMap['To Kill a Mockingbird'].id,
        copy_number: 'BC-TKM-002',
        condition: 'Fair',
        source_type: 'Donation',
        status: 'Maintenance'
      },
      // The Great Gatsby
      {
        book_id: bookMap['The Great Gatsby'].id,
        copy_number: 'BC-TGG-001',
        condition: 'Good',
        source_type: 'Purchase',
        status: 'Available'
      },
      // A Brief History of Time
      {
        book_id: bookMap['A Brief History of Time'].id,
        copy_number: 'BC-BHT-001',
        condition: 'Good',
        source_type: 'Purchase',
        status: 'Available'
      },
      // Sapiens
      {
        book_id: bookMap['Sapiens: A Brief History of Humankind'].id,
        copy_number: 'BC-SAP-001',
        condition: 'New',
        source_type: 'Purchase',
        status: 'Checked_Out_Home' // overdue borrow
      },
      // Meditations
      {
        book_id: bookMap['Meditations'].id,
        copy_number: 'BC-MED-001',
        condition: 'Good',
        source_type: 'Donation',
        status: 'Available'
      },
      // The Little Prince
      {
        book_id: bookMap['The Little Prince'].id,
        copy_number: 'BC-LP-001',
        condition: 'New',
        source_type: 'Donation',
        status: 'In_Library_Use' // reading session overdue
      }
    ];

    const copyMap = {};
    for (const c of copiesData) {
      const [copyRecord] = await BookCopy.findOrCreate({
        where: { copy_number: c.copy_number },
        defaults: c
      });
      copyMap[c.copy_number] = copyRecord;
    }

    // 6. Donation Requests (Feature 1: Requested, Approved, Rejected)
    console.log('Seeding Donation Requests...');
    const donationsData = [
      {
        donor_name: 'Dr. Clara Oswald',
        donor_email: 'clara.oswald@university.edu',
        donor_phone: '+1-555-7890',
        book_title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell and Peter Norvig',
        category_id: categoryMap['Computer Science & Technology'].id,
        quantity: 3,
        condition: 'Good',
        status: 'Approved',
        requestedbyid: librarianStaff.id,
        requestedat: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        requestremark: 'Donation from university computer science department.',
        approvedbyid: adminUser.id,
        approvedat: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        approvalremark: 'Approved. Textbooks accepted into student reserve shelf.'
      },
      {
        donor_name: 'Arthur Dent',
        donor_email: 'arthur.dent@galaxy.org',
        donor_phone: '+1-555-4242',
        book_title: 'The Hitchhiker\'s Guide to the Galaxy',
        author: 'Douglas Adams',
        category_id: categoryMap['Classic Literature & Fiction'].id,
        quantity: 2,
        condition: 'New',
        status: 'requested',
        requestedbyid: assistantStaff.id,
        requestedat: new Date(),
        requestremark: 'Hardcover collector editions offered by donor.'
      },
      {
        donor_name: 'Gregory House',
        donor_email: 'g.house@princeton.edu',
        donor_phone: '+1-555-9111',
        book_title: 'Outdated Diagnostic Manual (1985)',
        author: 'Old Health Press',
        category_id: categoryMap['Science & Physics'].id,
        quantity: 1,
        condition: 'Poor',
        status: 'Rejected',
        requestedbyid: librarianStaff.id,
        requestedat: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        requestremark: 'Old medical encyclopedia offered.',
        rejectedbyid: adminUser.id,
        rejectedat: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        rejectremark: 'Rejected due to obsolete medical content and damaged waterlogged pages.'
      }
    ];

    for (const d of donationsData) {
      await DonationRequest.findOrCreate({
        where: { donor_email: d.donor_email, book_title: d.book_title },
        defaults: d
      });
    }

    // 7. Suppliers (Feature 2: Book Addition Through Purchasing)
    console.log('Seeding Suppliers...');
    const suppliersData = [
      {
        name: 'Ingram Academic Wholesale Distribution',
        person_fullname: 'James Henderson',
        phone: '+1-800-555-0199',
        email: 'orders@ingramwholesale.com',
        address: '1400 Distribution Parkway, Nashville, TN 37217'
      },
      {
        name: 'Beacon Hill Book Distributors',
        person_fullname: 'Laura Sullivan',
        phone: '+1-617-555-0144',
        email: 'sales@beaconhillbooks.com',
        address: '45 Charles Street, Boston, MA 02114'
      },
      {
        name: 'O\'Reilly Direct Enterprise',
        person_fullname: 'Mark O\'Reilly',
        phone: '+1-707-555-0120',
        email: 'partnerships@oreillymedia.com',
        address: '1005 Gravenstein Highway North, Sebastopol, CA 95472'
      }
    ];

    const supplierMap = {};
    for (const s of suppliersData) {
      const [supRecord] = await Supplier.findOrCreate({
        where: { name: s.name },
        defaults: s
      });
      supplierMap[s.name] = supRecord;
    }

    // 8. Purchase Records & Purchase Items
    console.log('Seeding Purchase Records & Purchase Items...');
    const [purchaseReceived] = await PurchaseRecord.findOrCreate({
      where: {
        supplier_id: supplierMap['O\'Reilly Direct Enterprise'].id,
        orderremark: 'Q3 Software engineering textbook order'
      },
      defaults: {
        supplier_id: supplierMap['O\'Reilly Direct Enterprise'].id,
        purchase_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        total_cost: 299.70,
        status: 'Received',
        orderedbyid: librarianStaff.id,
        orderedat: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        orderremark: 'Q3 Software engineering textbook order',
        receivedat: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
        recevedbyid: adminUser.id,
        receiveremark: 'All 6 copies received in excellent boxed condition and tagged into inventory.'
      }
    });

    await PurchaseItem.findOrCreate({
      where: {
        purchase_record_id: purchaseReceived.id,
        title: 'Designing Data-Intensive Applications'
      },
      defaults: {
        purchase_record_id: purchaseReceived.id,
        book_id: bookMap['Designing Data-Intensive Applications'].id,
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        isbn: '978-1449373320',
        category_id: categoryMap['Computer Science & Technology'].id,
        quantity: 6,
        unit_price: 49.95
      }
    });

    const [purchaseOrdered] = await PurchaseRecord.findOrCreate({
      where: {
        supplier_id: supplierMap['Beacon Hill Book Distributors'].id,
        orderremark: 'Upcoming semester classic literature batch'
      },
      defaults: {
        supplier_id: supplierMap['Beacon Hill Book Distributors'].id,
        purchase_date: new Date(),
        total_cost: 160.00,
        status: 'Ordered',
        orderedbyid: assistantStaff.id,
        orderedat: new Date(),
        orderremark: 'Upcoming semester classic literature batch'
      }
    });

    await PurchaseItem.findOrCreate({
      where: {
        purchase_record_id: purchaseOrdered.id,
        title: 'The Great Gatsby'
      },
      defaults: {
        purchase_record_id: purchaseOrdered.id,
        book_id: bookMap['The Great Gatsby'].id,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '978-0743273565',
        category_id: categoryMap['Classic Literature & Fiction'].id,
        quantity: 10,
        unit_price: 16.00
      }
    });

    // 9. Book Lending & 10. Book Fines (Feature 3: Take-home lending, returns, and overdue fines)
    console.log('Seeding Book Lends & Book Fines...');

    // Loan 1: Active current loan (On time)
    const [loanActive] = await BookLend.findOrCreate({
      where: {
        book_copy_id: copyMap['BC-CC-002'].id,
        status: 'Lend'
      },
      defaults: {
        book_copy_id: copyMap['BC-CC-002'].id,
        Lendedtofullname: 'Alice Johnson',
        lendedtophoneno: '+1-555-0201',
        lendedtoemail: 'alice.johnson@gmail.com',
        user_id: memberOne.id,
        borrow_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        due_date: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000), // 11 days remaining
        status: 'Lend',
        lendedbyId: librarianStaff.id,
        lendedaat: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        lendedremark: '14-day standard member borrowing'
      }
    });

    // Loan 2: Returned on time
    const [loanReturnedOnTime] = await BookLend.findOrCreate({
      where: {
        Lendedtofullname: 'David Smith',
        lendedremark: 'Returned on time without damages'
      },
      defaults: {
        book_copy_id: copyMap['BC-BHT-001'].id,
        Lendedtofullname: 'David Smith',
        lendedtophoneno: '+1-555-0202',
        lendedtoemail: 'david.smith@yahoo.com',
        user_id: memberTwo.id,
        borrow_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        due_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        return_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'Returned',
        lendedbyId: librarianStaff.id,
        lendedaat: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        returnedbyid: assistantStaff.id,
        returnedat: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        returnremark: 'Returned on time without damages'
      }
    });

    // Loan 3: Returned Overdue with a PAID fine
    const [loanReturnedOverdue] = await BookLend.findOrCreate({
      where: {
        Lendedtofullname: 'Alice Johnson',
        lendedremark: 'Returned 4 days late'
      },
      defaults: {
        book_copy_id: copyMap['BC-TGG-001'].id,
        Lendedtofullname: 'Alice Johnson',
        lendedtophoneno: '+1-555-0201',
        lendedtoemail: 'alice.johnson@gmail.com',
        user_id: memberOne.id,
        borrow_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        due_date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
        return_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'Returned',
        lendedbyId: librarianStaff.id,
        lendedaat: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        returnedbyid: assistantStaff.id,
        returnedat: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        returnremark: 'Returned 4 days late'
      }
    });

    await BookFine.findOrCreate({
      where: { Book_loan_id: loanReturnedOverdue.id },
      defaults: {
        Book_loan_id: loanReturnedOverdue.id,
        amount: 4.00,
        status: 'Paid',
        paidbyid: assistantStaff.id,
        paidat: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        paidremark: 'Paid via credit card at front circulation desk'
      }
    });

    // Loan 4: Currently Overdue loan with an UNPAID fine
    const [loanOverdue] = await BookLend.findOrCreate({
      where: {
        book_copy_id: copyMap['BC-SAP-001'].id,
        status: 'Lend'
      },
      defaults: {
        book_copy_id: copyMap['BC-SAP-001'].id,
        Lendedtofullname: 'David Smith',
        lendedtophoneno: '+1-555-0202',
        lendedtoemail: 'david.smith@yahoo.com',
        user_id: memberTwo.id,
        borrow_date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        due_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days overdue
        status: 'Lend',
        lendedbyId: assistantStaff.id,
        lendedaat: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        lendedremark: 'Borrowed for research paper'
      }
    });

    await BookFine.findOrCreate({
      where: { Book_loan_id: loanOverdue.id },
      defaults: {
        Book_loan_id: loanOverdue.id,
        amount: 4.00,
        status: 'Unpaid'
      }
    });

    // 11. Book In-Library Sessions (Feature 4: Reading inside the library)
    console.log('Seeding Book In-Library Sessions...');

    // Session 1: Active in-library reading (Status: Received, on time)
    await BookInLibrarySession.findOrCreate({
      where: {
        book_copy_id: copyMap['BC-DDIA-001'].id,
        status: 'Received'
      },
      defaults: {
        book_copy_id: copyMap['BC-DDIA-001'].id,
        user_fullname: 'Emily Davis',
        user_email: 'emily.visitor@outlook.com',
        user_phone: '+1-555-0301',
        user_id: visitorOne.id,
        receivedbyid: assistantStaff.id,
        receivedat: new Date(Date.now() - 45 * 60 * 1000), // checked out 45 mins ago
        receiveremark: 'Visitor study desk session #4',
        checkout_time: new Date(Date.now() - 45 * 60 * 1000),
        expected_return_time: new Date(Date.now() + 75 * 60 * 1000), // due in 75 mins
        status: 'Received'
      }
    });

    // Session 2: Successfully Returned to shelf
    await BookInLibrarySession.findOrCreate({
      where: {
        user_fullname: 'Alice Johnson',
        returnremark: 'Reader finished reading chapter 3, book reshelved.'
      },
      defaults: {
        book_copy_id: copyMap['BC-MED-001'].id,
        user_fullname: 'Alice Johnson',
        user_email: 'alice.johnson@gmail.com',
        user_phone: '+1-555-0201',
        user_id: memberOne.id,
        receivedbyid: librarianStaff.id,
        receivedat: new Date(Date.now() - 3 * 60 * 60 * 1000),
        receiveremark: 'Quick afternoon reading lounge session',
        returnedbyid: librarianStaff.id,
        returnedat: new Date(Date.now() - 1 * 60 * 60 * 1000),
        returnremark: 'Reader finished reading chapter 3, book reshelved.',
        checkout_time: new Date(Date.now() - 3 * 60 * 60 * 1000),
        expected_return_time: new Date(Date.now() - 1 * 60 * 60 * 1000),
        actual_return_time: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: 'Returned'
      }
    });

    // Session 3: Desk Overdue (Reader hasn't returned book copy past expected return time)
    await BookInLibrarySession.findOrCreate({
      where: {
        book_copy_id: copyMap['BC-LP-001'].id,
        status: 'Desk_Overdue'
      },
      defaults: {
        book_copy_id: copyMap['BC-LP-001'].id,
        user_fullname: 'David Smith',
        user_email: 'david.smith@yahoo.com',
        user_phone: '+1-555-0202',
        user_id: memberTwo.id,
        receivedbyid: assistantStaff.id,
        receivedat: new Date(Date.now() - 4 * 60 * 60 * 1000),
        receiveremark: 'Reading in quiet area 2B',
        checkout_time: new Date(Date.now() - 4 * 60 * 60 * 1000),
        expected_return_time: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour past due!
        status: 'Desk_Overdue'
      }
    });

    console.log('✓ All 12 tables seeded with realistic sample data successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding sample data:', error);
    throw error;
  }
};

// If run directly: node src/seeders/seedSampleData.js
if (require.main === module) {
  const isSqlite = (process.env.DB_DIALECT || 'postgres') === 'sqlite';
  sequelize.sync(isSqlite ? {} : { alter: true })
    .then(() => seedSampleData())
    .then(() => {
      console.log('Seeding process finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to run seed:', err.message);
      process.exit(1);
    });
}

module.exports = seedSampleData;

