const { Book, BookCopy, Category } = require('../models');
const { Op } = require('sequelize');

const getBooks = async (req, res, next) => {
  try {
    const { search, category_id } = req.query;
    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike || Op.like]: `%${search}%` } },
        { author: { [Op.iLike || Op.like]: `%${search}%` } },
        { isbn: { [Op.iLike || Op.like]: `%${search}%` } }
      ];
    }

    if (category_id) {
      where.category_id = category_id;
    }

    const books = await Book.findAll({
      where,
      include: [
        { model: Category, as: 'category' },
        { model: BookCopy, as: 'copies' }
      ],
      order: [['id', 'DESC']]
    });

    const booksWithStats = books.map(book => {
      const b = book.toJSON();
      const totalCopies = b.copies ? b.copies.length : 0;
      const availableCopies = b.copies ? b.copies.filter(c => c.status === 'Available').length : 0;
      return {
        ...b,
        totalCopies,
        availableCopies
      };
    });

    res.status(200).json({ success: true, count: booksWithStats.length, data: booksWithStats });
  } catch (error) {
    next(error);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: BookCopy, as: 'copies' }
      ]
    });

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const b = book.toJSON();
    const totalCopies = b.copies ? b.copies.length : 0;
    const availableCopies = b.copies ? b.copies.filter(c => c.status === 'Available').length : 0;

    res.status(200).json({
      success: true,
      data: {
        ...b,
        totalCopies,
        availableCopies
      }
    });
  } catch (error) {
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const { title, author, isbn, category_id, initial_copies, condition, source_type } = req.body;

    if (!title || !author) {
      return res.status(400).json({ success: false, message: 'Title and author are required' });
    }

    const book = await Book.create({
      title,
      author,
      isbn,
      category_id: category_id || null
    });

    // Optionally create initial physical copies
    const numCopies = parseInt(initial_copies, 10) || 0;
    const createdCopies = [];
    for (let i = 1; i <= numCopies; i++) {
      const copyNumber = `BC-${book.id}-${Date.now().toString().slice(-4)}-${i}`;
      const copy = await BookCopy.create({
        book_id: book.id,
        copy_number: copyNumber,
        condition: condition || 'New',
        source_type: source_type || 'Purchase',
        status: 'Available'
      });
      createdCopies.push(copy);
    }

    const result = await Book.findByPk(book.id, {
      include: [
        { model: Category, as: 'category' },
        { model: BookCopy, as: 'copies' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const { title, author, isbn, category_id } = req.body;
    if (title) book.title = title;
    if (author) book.author = author;
    if (isbn !== undefined) book.isbn = isbn;
    if (category_id !== undefined) book.category_id = category_id;

    await book.save();

    const updated = await Book.findByPk(book.id, {
      include: [{ model: Category, as: 'category' }, { model: BookCopy, as: 'copies' }]
    });

    res.status(200).json({ success: true, message: 'Book updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    await book.destroy();
    res.status(200).json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Book Copy Controllers
const getCopies = async (req, res, next) => {
  try {
    const { status, condition, source_type, book_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (condition) where.condition = condition;
    if (source_type) where.source_type = source_type;
    if (book_id) where.book_id = book_id;

    const copies = await BookCopy.findAll({
      where,
      include: [{ model: Book, as: 'book', include: [{ model: Category, as: 'category' }] }],
      order: [['id', 'DESC']]
    });

    res.status(200).json({ success: true, count: copies.length, data: copies });
  } catch (error) {
    next(error);
  }
};

const getCopyById = async (req, res, next) => {
  try {
    const copy = await BookCopy.findByPk(req.params.id, {
      include: [{ model: Book, as: 'book', include: [{ model: Category, as: 'category' }] }]
    });

    if (!copy) {
      return res.status(404).json({ success: false, message: 'Book copy not found' });
    }

    res.status(200).json({ success: true, data: copy });
  } catch (error) {
    next(error);
  }
};

const addCopiesToBook = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const { quantity, condition, source_type } = req.body;
    const count = parseInt(quantity, 10) || 1;
    const copies = [];

    for (let i = 1; i <= count; i++) {
      const copyNumber = `BC-${book.id}-${Date.now().toString().slice(-4)}-${i}`;
      const copy = await BookCopy.create({
        book_id: book.id,
        copy_number: copyNumber,
        condition: condition || 'Good',
        source_type: source_type || 'Purchase',
        status: 'Available'
      });
      copies.push(copy);
    }

    res.status(201).json({
      success: true,
      message: `${count} copy/copies added successfully`,
      data: copies
    });
  } catch (error) {
    next(error);
  }
};

const updateCopyStatus = async (req, res, next) => {
  try {
    const copy = await BookCopy.findByPk(req.params.id);
    if (!copy) {
      return res.status(404).json({ success: false, message: 'Book copy not found' });
    }

    const { status, condition, copy_number } = req.body;
    if (status) copy.status = status;
    if (condition) copy.condition = condition;
    if (copy_number) copy.copy_number = copy_number;

    await copy.save();

    res.status(200).json({ success: true, message: 'Copy updated successfully', data: copy });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getCopies,
  getCopyById,
  addCopiesToBook,
  updateCopyStatus
};

