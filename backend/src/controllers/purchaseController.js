const { PurchaseRecord, PurchaseItem, Supplier, Book, BookCopy, User } = require('../models');

/**
 * Create a new purchase record with items
 */
const createPurchase = async (req, res, next) => {
  try {
    const {
      supplier_id,
      purchase_date,
      orderremark,
      orderedbyid,
      items
    } = req.body;

    if (!supplier_id) {
      return res.status(400).json({ success: false, message: 'supplier_id is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one purchase item is required' });
    }

    const supplier = await Supplier.findByPk(supplier_id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    // Calculate total cost
    let calculatedTotal = 0;
    for (const item of items) {
      const qty = parseInt(item.quantity, 10) || 1;
      const price = parseFloat(item.unit_price) || 0;
      calculatedTotal += qty * price;
    }

    const effectiveOrderedById = orderedbyid || (req.user ? req.user.id : null);

    const purchase = await PurchaseRecord.create({
      supplier_id,
      purchase_date: purchase_date || new Date(),
      total_cost: calculatedTotal.toFixed(2),
      status: 'Ordered',
      orderedbyid: effectiveOrderedById,
      orderedat: new Date(),
      orderremark
    });

    // Create purchase items
    const createdItems = [];
    for (const item of items) {
      const createdItem = await PurchaseItem.create({
        purchase_record_id: purchase.id,
        book_id: item.book_id || null,
        title: item.title || 'Untitled',
        author: item.author || 'Unknown',
        isbn: item.isbn || null,
        category_id: item.category_id || null,
        quantity: parseInt(item.quantity, 10) || 1,
        unit_price: parseFloat(item.unit_price) || 0
      });
      createdItems.push(createdItem);
    }

    const result = await PurchaseRecord.findByPk(purchase.id, {
      include: [
        { model: Supplier, as: 'supplier' },
        { model: PurchaseItem, as: 'items' },
        { model: User, as: 'orderedBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Purchase record created successfully in Ordered status',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all purchase records
 */
const getPurchases = async (req, res, next) => {
  try {
    const { status, supplier_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (supplier_id) where.supplier_id = supplier_id;

    const purchases = await PurchaseRecord.findAll({
      where,
      include: [
        { model: Supplier, as: 'supplier' },
        { model: PurchaseItem, as: 'items', include: [{ model: Book, as: 'book' }] },
        { model: User, as: 'orderedBy', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'receivedBy', attributes: ['id', 'name', 'email'] }
      ],
      order: [['id', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get purchase by ID
 */
const getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await PurchaseRecord.findByPk(req.params.id, {
      include: [
        { model: Supplier, as: 'supplier' },
        { model: PurchaseItem, as: 'items', include: [{ model: Book, as: 'book' }] },
        { model: User, as: 'orderedBy', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'receivedBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase record not found' });
    }

    res.status(200).json({ success: true, data: purchase });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm receipt of purchased books:
 * "Automatically increase inventory after confirming receipt."
 */
const receivePurchase = async (req, res, next) => {
  try {
    const purchase = await PurchaseRecord.findByPk(req.params.id, {
      include: [{ model: PurchaseItem, as: 'items' }]
    });

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase record not found' });
    }

    if (purchase.status === 'Received') {
      return res.status(400).json({ success: false, message: 'Purchase has already been marked as Received' });
    }

    const { recevedbyid, receiveremark } = req.body;
    const effectiveReceivedById = recevedbyid || (req.user ? req.user.id : null);

    const inventoryAdded = [];

    // Process each item and add to library inventory
    for (const item of purchase.items) {
      let book;

      if (item.book_id) {
        book = await Book.findByPk(item.book_id);
      }

      if (!book && item.isbn) {
        book = await Book.findOne({ where: { isbn: item.isbn } });
      }

      if (!book) {
        book = await Book.findOne({
          where: {
            title: item.title,
            author: item.author
          }
        });
      }

      // If book still doesn't exist, create it
      if (!book) {
        book = await Book.create({
          title: item.title,
          author: item.author,
          isbn: item.isbn,
          category_id: item.category_id || null
        });
        // Link book_id on item
        item.book_id = book.id;
        await item.save();
      }

      // Automatically create item.quantity physical copies
      const count = item.quantity || 1;
      const copiesCreated = [];
      for (let i = 1; i <= count; i++) {
        const copyNumber = `BC-PUR-${book.id}-${Date.now().toString().slice(-4)}-${i}`;
        const copy = await BookCopy.create({
          book_id: book.id,
          copy_number: copyNumber,
          condition: 'New',
          source_type: 'Purchase',
          status: 'Available'
        });
        copiesCreated.push(copy);
      }

      inventoryAdded.push({
        bookId: book.id,
        title: book.title,
        quantity: count,
        copies: copiesCreated
      });
    }

    // Update Purchase Record
    purchase.status = 'Received';
    purchase.receivedat = new Date();
    purchase.recevedbyid = effectiveReceivedById;
    purchase.receiveremark = receiveremark || 'Stock received and inventory increased';
    await purchase.save();

    const updatedPurchase = await PurchaseRecord.findByPk(purchase.id, {
      include: [
        { model: Supplier, as: 'supplier' },
        { model: PurchaseItem, as: 'items', include: [{ model: Book, as: 'book' }] },
        { model: User, as: 'receivedBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Purchase receipt confirmed. Books and copies added to inventory!',
      data: {
        purchase: updatedPurchase,
        inventoryAdded
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPurchase,
  getPurchases,
  getPurchaseById,
  receivePurchase
};

