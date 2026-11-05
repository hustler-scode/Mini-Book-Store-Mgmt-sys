const { BookFine, BookLend, BookCopy, Book, User } = require('../models');

const getFines = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const fines = await BookFine.findAll({
      where,
      include: [
        {
          model: BookLend,
          as: 'loan',
          include: [
            {
              model: BookCopy,
              as: 'bookCopy',
              include: [{ model: Book, as: 'book' }]
            }
          ]
        },
        { model: User, as: 'paidBy', attributes: ['id', 'name', 'email'] }
      ],
      order: [['id', 'DESC']]
    });

    res.status(200).json({ success: true, count: fines.length, data: fines });
  } catch (error) {
    next(error);
  }
};

const getFineById = async (req, res, next) => {
  try {
    const fine = await BookFine.findByPk(req.params.id, {
      include: [
        {
          model: BookLend,
          as: 'loan',
          include: [
            {
              model: BookCopy,
              as: 'bookCopy',
              include: [{ model: Book, as: 'book' }]
            }
          ]
        },
        { model: User, as: 'paidBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine record not found' });
    }

    res.status(200).json({ success: true, data: fine });
  } catch (error) {
    next(error);
  }
};

const payFine = async (req, res, next) => {
  try {
    const fine = await BookFine.findByPk(req.params.id);
    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine record not found' });
    }

    if (fine.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'Fine has already been paid' });
    }

    const { paidbyid, paidremark } = req.body;
    const effectivePaidById = paidbyid || (req.user ? req.user.id : null);

    fine.status = 'Paid';
    fine.paidat = new Date();
    fine.paidbyid = effectivePaidById;
    fine.paidremark = paidremark || 'Fine settled in full';

    await fine.save();

    const updated = await BookFine.findByPk(fine.id, {
      include: [
        { model: BookLend, as: 'loan' },
        { model: User, as: 'paidBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Fine paid and cleared successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFines,
  getFineById,
  payFine
};

