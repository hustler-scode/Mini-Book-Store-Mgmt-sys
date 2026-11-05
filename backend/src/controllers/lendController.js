const { BookLend, BookCopy, Book, BookFine, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Borrow a book copy for take-home reading
 * Strict validation: prevents lending the same physical copy to multiple members simultaneously.
 */
const borrowBook = async (req, res, next) => {
  try {
    const {
      book_copy_id,
      Lendedtofullname,
      lendedtophoneno,
      lendedtoemail,
      user_id,
      borrow_date,
      due_date,
      lendedremark,
      lendedbyId
    } = req.body;

    if (!book_copy_id || !Lendedtofullname || !due_date) {
      return res.status(400).json({
        success: false,
        message: 'book_copy_id, Lendedtofullname, and due_date are required'
      });
    }

    // 1. Check physical copy existence and availability
    const copy = await BookCopy.findByPk(book_copy_id, {
      include: [{ model: Book, as: 'book' }]
    });

    if (!copy) {
      return res.status(404).json({ success: false, message: 'Book copy not found' });
    }

    // Concurrency prevention: verify copy is Available
    if (copy.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Cannot lend this book copy. It is currently in '${copy.status}' status and cannot be lent simultaneously.`
      });
    }

    const effectiveLendedById = lendedbyId || (req.user ? req.user.id : null);
    const borrowDateParsed = borrow_date ? new Date(borrow_date) : new Date();
    const dueDateParsed = new Date(due_date);

    if (dueDateParsed <= borrowDateParsed) {
      return res.status(400).json({
        success: false,
        message: 'due_date must be after borrow_date'
      });
    }

    // 2. Update copy status to Checked_Out_Home
    copy.status = 'Checked_Out_Home';
    await copy.save();

    // 3. Create BookLend record
    const lend = await BookLend.create({
      book_copy_id: copy.id,
      Lendedtofullname,
      lendedtophoneno,
      lendedtoemail,
      user_id: user_id || null,
      borrow_date: borrowDateParsed,
      due_date: dueDateParsed,
      status: 'Lend',
      lendedbyId: effectiveLendedById,
      lendedaat: new Date(),
      lendedremark
    });

    const result = await BookLend.findByPk(lend.id, {
      include: [
        { model: BookCopy, as: 'bookCopy', include: [{ model: Book, as: 'book' }] },
        { model: User, as: 'lendedBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Book successfully lent to member.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Return a borrowed book copy
 * Checks if overdue and automatically generates fine record if applicable
 */
const returnBook = async (req, res, next) => {
  try {
    const lend = await BookLend.findByPk(req.params.id, {
      include: [
        { model: BookCopy, as: 'bookCopy' },
        { model: BookFine, as: 'fine' }
      ]
    });

    if (!lend) {
      return res.status(404).json({ success: false, message: 'Lend record not found' });
    }

    if (lend.status === 'Returned') {
      return res.status(400).json({ success: false, message: 'Book copy has already been returned' });
    }

    const {
      returnedbyid,
      returnremark,
      return_condition,
      custom_fine_amount
    } = req.body;

    const effectiveReturnedById = returnedbyid || (req.user ? req.user.id : null);
    const returnDate = new Date();

    // Check overdue and calculate possible fine
    let fineRecord = null;
    let daysOverdue = 0;
    const dueDate = new Date(lend.due_date);

    if (returnDate > dueDate) {
      const diffTime = returnDate.getTime() - dueDate.getTime();
      daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const finePerDay = 1.00; // $1.00 per day
      const calculatedFine = custom_fine_amount !== undefined 
        ? parseFloat(custom_fine_amount) 
        : parseFloat((daysOverdue * finePerDay).toFixed(2));

      if (calculatedFine > 0) {
        fineRecord = await BookFine.create({
          Book_loan_id: lend.id,
          amount: calculatedFine,
          status: 'Unpaid'
        });
      }
    }

    // 1. Mark lend record as Returned
    lend.status = 'Returned';
    lend.return_date = returnDate;
    lend.returnedat = returnDate;
    lend.returnedbyid = effectiveReturnedById;
    lend.returnremark = returnremark || (daysOverdue > 0 ? `Returned ${daysOverdue} days overdue` : 'Returned on time');
    await lend.save();

    // 2. Mark book copy back to Available (or updated condition)
    if (lend.bookCopy) {
      lend.bookCopy.status = 'Available';
      if (return_condition) {
        lend.bookCopy.condition = return_condition;
      }
      await lend.bookCopy.save();
    }

    const updatedLend = await BookLend.findByPk(lend.id, {
      include: [
        { model: BookCopy, as: 'bookCopy', include: [{ model: Book, as: 'book' }] },
        { model: BookFine, as: 'fine' },
        { model: User, as: 'lendedBy', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'returnedBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: daysOverdue > 0
        ? `Book returned successfully. Note: It was ${daysOverdue} day(s) overdue. Fine record created.`
        : 'Book returned successfully on time. Inventory updated to Available.',
      data: {
        lend: updatedLend,
        daysOverdue,
        fine: fineRecord
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all lends (with filters)
 */
const getLends = async (req, res, next) => {
  try {
    const { status, book_copy_id, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (book_copy_id) where.book_copy_id = book_copy_id;

    if (search) {
      where[Op.or] = [
        { Lendedtofullname: { [Op.iLike || Op.like]: `%${search}%` } },
        { lendedtoemail: { [Op.iLike || Op.like]: `%${search}%` } },
        { lendedtophoneno: { [Op.iLike || Op.like]: `%${search}%` } }
      ];
    }

    const lends = await BookLend.findAll({
      where,
      include: [
        { model: BookCopy, as: 'bookCopy', include: [{ model: Book, as: 'book' }] },
        { model: BookFine, as: 'fine' },
        { model: User, as: 'lendedBy', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'returnedBy', attributes: ['id', 'name', 'email'] }
      ],
      order: [['id', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: lends.length,
      data: lends
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List overdue active loans
 */
const getOverdueLends = async (req, res, next) => {
  try {
    const now = new Date();
    const overdueLends = await BookLend.findAll({
      where: {
        status: 'Lend',
        due_date: {
          [Op.lt]: now
        }
      },
      include: [
        { model: BookCopy, as: 'bookCopy', include: [{ model: Book, as: 'book' }] },
        { model: User, as: 'lendedBy', attributes: ['id', 'name', 'email'] }
      ],
      order: [['due_date', 'ASC']]
    });

    const formatted = overdueLends.map(item => {
      const obj = item.toJSON();
      const diffTime = now.getTime() - new Date(obj.due_date).getTime();
      const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...obj,
        daysOverdue,
        estimatedFine: (daysOverdue * 1.00).toFixed(2)
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get lend by ID
 */
const getLendById = async (req, res, next) => {
  try {
    const lend = await BookLend.findByPk(req.params.id, {
      include: [
        { model: BookCopy, as: 'bookCopy', include: [{ model: Book, as: 'book' }] },
        { model: BookFine, as: 'fine' },
        { model: User, as: 'lendedBy', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'returnedBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!lend) {
      return res.status(404).json({ success: false, message: 'Lend record not found' });
    }

    res.status(200).json({ success: true, data: lend });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  borrowBook,
  returnBook,
  getLends,
  getOverdueLends,
  getLendById
};

