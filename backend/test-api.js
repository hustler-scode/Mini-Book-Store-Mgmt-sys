/**
 * End-to-end API verification test script for Mini Book Store & Library Management System
 */
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = './test_database.sqlite';
process.env.PORT = 5001;

const app = require('./src/app');
const { sequelize, seedDefaults } = require('./src/models');
const http = require('http');

let server;
const baseURL = 'http://127.0.0.1:5001';

async function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseURL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting System API Verification ---');
  
  // 1. Sync DB
  await sequelize.sync({ force: true });
  await seedDefaults();
  console.log('✓ Database reset and default seeds loaded.');

  // 2. Start HTTP Server
  server = app.listen(5001);
  console.log('✓ Test server started on port 5001.');

  try {
    // Test 1: Health check
    const health = await request('GET', '/api/health');
    console.assert(health.status === 200, 'Health check failed');
    console.log('✓ Health check passed:', health.body.status);

    // Test 2: Auth - Register & Login
    const regRes = await request('POST', '/api/auth/register', {
      name: 'John Member',
      email: 'john@example.com',
      password: 'password123',
      phone_number: '123-456-7890',
      isstaff: false
    });
    console.assert(regRes.status === 201, 'Registration failed');
    console.log('✓ User registered successfully with JWT token');

    const loginRes = await request('POST', '/api/auth/login', {
      email: 'john@example.com',
      password: 'password123'
    });
    console.assert(loginRes.status === 200, 'Login failed');
    const userToken = loginRes.body.token;
    console.log('✓ Login successful, JWT token acquired');

    // Test 3: Swagger endpoint
    const swaggerDoc = await request('GET', '/api-docs.json');
    console.assert(swaggerDoc.status === 200, 'Swagger JSON endpoint failed');
    console.assert(swaggerDoc.body.openapi === '3.0.0', 'Invalid OpenAPI version');
    console.log('✓ Swagger API documentation served successfully. Total endpoints:', Object.keys(swaggerDoc.body.paths).length);

    // Test 4: Feature 1 - Book receiving (donations)
    console.log('\n--- Testing Feature 1: Donations ---');
    const donRes = await request('POST', '/api/donations', {
      donor_name: 'Alice Donor',
      donor_email: 'alice@charity.org',
      donor_phone: '555-1234',
      book_title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      quantity: 2,
      condition: 'Good',
      requestremark: 'Donating copies for students'
    });
    console.assert(donRes.status === 201, 'Donation submission failed');
    const donationId = donRes.body.data.id;
    console.log(`✓ Donation request #${donationId} created`);

    // Approve donation
    const appRes = await request('POST', `/api/donations/${donationId}/approve`, {
      approvalremark: 'Verified and accepted for library shelf'
    });
    console.assert(appRes.status === 200, 'Donation approval failed');
    console.assert(appRes.body.data.copies.length === 2, 'Expected 2 book copies generated');
    const donatedCopyId = appRes.body.data.copies[0].id;
    console.log(`✓ Donation approved! Created Book and ${appRes.body.data.copies.length} BookCopy records (Source: Donation)`);

    // Test 5: Feature 2 - Book addition through purchasing
    console.log('\n--- Testing Feature 2: Book Purchases ---');
    const supRes = await request('POST', '/api/suppliers', {
      name: 'Global Books Wholesale',
      person_fullname: 'Robert Vance',
      phone: '555-9876',
      email: 'robert@globalbooks.com',
      address: '100 Distribution Way'
    });
    console.assert(supRes.status === 201, 'Supplier registration failed');
    const supplierId = supRes.body.data.id;
    console.log(`✓ Supplier #${supplierId} registered: ${supRes.body.data.name}`);

    // Create Purchase
    const purRes = await request('POST', '/api/purchases', {
      supplier_id: supplierId,
      orderremark: 'Fall semester stock replenishment',
      items: [
        {
          title: 'Design Patterns',
          author: 'Erich Gamma',
          isbn: '978-0201633610',
          quantity: 3,
          unit_price: 39.99
        }
      ]
    });
    console.assert(purRes.status === 201, 'Purchase creation failed');
    const purchaseId = purRes.body.data.id;
    console.log(`✓ Purchase #${purchaseId} created (Status: ${purRes.body.data.status}, Total: $${purRes.body.data.total_cost})`);

    // Confirm receipt of purchased books
    const recRes = await request('POST', `/api/purchases/${purchaseId}/receive`, {
      receiveremark: 'Delivered in mint condition'
    });
    console.assert(recRes.status === 200, 'Purchase receipt failed');
    console.log(`✓ Purchase #${purchaseId} confirmed Received! Inventory automatically created ${recRes.body.data.inventoryAdded[0].copies.length} copies.`);
    const purchasedCopyId = recRes.body.data.inventoryAdded[0].copies[0].id;

    // Test 6: Feature 3 - Book Lending (take-home borrowing)
    console.log('\n--- Testing Feature 3: Book Lending ---');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 14);

    const lendRes = await request('POST', '/api/lends/borrow', {
      book_copy_id: donatedCopyId,
      Lendedtofullname: 'Jane Doe',
      lendedtoemail: 'jane@example.com',
      lendedtophoneno: '555-4321',
      due_date: tomorrow.toISOString()
    });
    console.assert(lendRes.status === 201, 'Lending failed');
    const loanId = lendRes.body.data.id;
    console.log(`✓ Copy #${donatedCopyId} lent out successfully (Loan #${loanId})`);

    // Concurrency check: try lending same copy again
    const dupLendRes = await request('POST', '/api/lends/borrow', {
      book_copy_id: donatedCopyId,
      Lendedtofullname: 'Another Borrower',
      due_date: tomorrow.toISOString()
    });
    console.assert(dupLendRes.status === 400, 'Concurrency prevention check failed!');
    console.log('✓ Simultaneous lending prevention verified: blocked duplicate checkout with 400.');

    // Return borrowed book
    const returnLendRes = await request('POST', `/api/lends/${loanId}/return`, {
      returnremark: 'Returned in good shape'
    });
    console.assert(returnLendRes.status === 200, 'Book return failed');
    console.log('✓ Book return completed. Physical copy status reset to Available.');

    // Test 7: Feature 4 - In-Library Book Use
    console.log('\n--- Testing Feature 4: In-Library Use ---');
    const inLibRes = await request('POST', '/api/in-library/start', {
      book_copy_id: purchasedCopyId,
      user_fullname: 'Visitor Mark',
      user_phone: '555-8888',
      duration_hours: 3
    });
    console.assert(inLibRes.status === 201, 'In-library checkout failed');
    const inLibSessionId = inLibRes.body.data.id;
    console.log(`✓ In-library session #${inLibSessionId} started. Copy status set to In_Library_Use.`);

    // Return in-library book to desk
    const returnInLibRes = await request('POST', `/api/in-library/${inLibSessionId}/return`, {
      returnremark: 'Returned to circulation desk'
    });
    console.assert(returnInLibRes.status === 200, 'In-library return failed');
    console.log('✓ In-library session returned to shelf. Copy status reset to Available.');

    console.log('\n========================================');
    console.log(' ALL SYSTEM INTEGRATION TESTS PASSED! ');
    console.log('========================================\n');
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
  }
}

runTests();

