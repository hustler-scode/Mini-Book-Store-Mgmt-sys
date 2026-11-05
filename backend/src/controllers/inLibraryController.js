const { BookInLibrarySession, BookCopy, Book, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Start an in-library reading session
 * Checks copy availability and marks it 'In_Library_Use'
 */
const startSession = async (req, res, next) => {
  try {
    const {
      book_copy_id,
      user_fullname,
      user_email,
      user_phone,
      user_id,
      expected_return_time,
      duration_hours,
      receiveremark,
      receivedbyid
    } = req.body;

    if (!book_copy_id || !user_fullname) {
      return res.status(400).json({
        success: false,
        message: 'book_copy_id and user_fullname are required'
      });
    }

    const copy = await BookCopy.findByPk(book_copy_id, {
      include: [{ model: Book, as: 'book' }]
    });

    if (!copy) {
      return res.status(404).json({ success: false, message: 'Book copy not found' });
    }

    if (copy.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `Book copy cannot be used. It is currently in '${copy.status}' status.`
      });
    }

    const checkoutTime = new Date();
    let expectedTime;

    if (expected_return_time) {
      expectedTime = new Date(expected_return_time);
    } else {
      const hours = parseInt(duration_hours, 10) || 2; // Default 2 hours reading session
      expectedTime = new Date(checkoutTime.getTime() + hours * 60 * 60 * 1000);
    }

    const effectiveReceivedById = receivedbyid || (req.user ? req.user.id : null);

    // 1. Mark book copy as In_Library_Use
    copy.status = 'In_Library_Use';
    await copy.save();

    // 2. Create in-library session
    const session = await BookInLibrarySession.create({
      book_copy_id: copy.id,
      user_fullname,
      user_email,
      user_phone,
      user_id: user_id || null,
      receivedbyid: effectiveReceivedById,
      receivedat: checkoutTime,
      receiveremark: receiveremark || 'In-library reading session opened',
      checkout_time: checkoutTime,
      expected_return_time: expectedTime,
      status: 'Received'
    });

    const result = await BookInLibrarySession.findByPk(session.id, {
      include: [
        { model: BookCopy, as: 'bookCopy', include: [{ model: Book, as: 'book' }] },
        { model: User, as: 'receivedBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'In-library reading session started successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Return in-library book to shelf/desk
 * Marks copy back to Available
 */
const returnSession = async (req, res, next) => {
  try {
    const session = await BookInLibrarySession.findByPk(req.params.id, {
      include: [{ model: BookCopy, as: 'bookCopy' }]
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'In-library session not found' });
    }

    if (session.status === 'Returned') {
      return res.status(400).json({ success: false, message: 'Book copy has already been returned to the desk/shelf' });
    }

    const { returnedbyid, returnremark, condition } = req.body;
    const effectiveReturnedById = returnedbyid || (req.user ? req.user.id : null);
    const returnTime = new Date();

    // 1. Mark session as Returned
    session.status = 'Returned';
    session.actual_return_time = returnTime;
    session.returnedat = returnTime;
    session.returnedbyid = effectiveReturnedById;
    session.returnremark = returnremark || 'Returned safely to desk';
    await session.save();

    // 2. Mark copy status back to Available
    if (session.bookCopy) {
      session.bookCopy.status = 'Available';
      if (condition) session.bookCopy.condition = condition;
      await session.bookCopy.save();
    }

    const updated = await BookInLibrarySession.findByPk(session.id, {
      include: [
        { model: BookCopy, as: 'bookCopy', include: [{ model: Book, as: 'book' }] },
        { model: User, as: 'receivedBy', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'returnedBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Book returned to desk/shelf. Copy is now Available.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all in-library sessions (with filter for status, search)
 */
const getSessions = async (req, res, next) => {
  try {
    const { status, book_copy_id, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (book_copy_id) where.book_copy_id = book_copy_id;

    if (search) {
      where[Op.or] = [
        { user_fullname: { [Op.iLike || Op.like]: `%${search}%` } },
        { user_email: { [Op.iLike || Op.like]: `%${search}%` } },
        { user_phone: { [Op.iLike || Op.like]: `%${search}%` } }
      ];
    }

    const sessions = await BookInLibrarySession.findAll({
      where,
      include: [
        { model: BookCopy, as: 'bookCopy', include: [{ model: Book, as: 'book' }] },
        { model: User, as: 'receivedBy', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'returnedBy', attributes: ['id', 'name', 'email'] }
      ],
      order: [['id', 'DESC']]
    });

    res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    next(error);
  }
};

/**
 * Track and return books that are overdue for return to the desk
 * Automatically updates status to 'Desk_Overdue' for active overdue sessions
 */
const getOverdueSessions = async (req, res, next) => {
  try {
    const now = new Date();

    // Find all sessions still in 'Received' status but past expected_return_time
    const activeOverdue = await BookInLibrarySession.findAll({
      where: {
        status: {
          [Op.in]: ['Received', 'Desk_Overdue']
        },
        expected_return_time: {
          [Op.lt]: now
        }
      },
      include: [
        { model: BookCopy, as: 'bookCopy', include: [{ model: Book, as: 'book' }] },
        { model: User, as: 'receivedBy', attributes: ['id', 'name', 'email'] }
      ],
      order: [['expected_return_time', 'ASC']]
    });

    // Update status to Desk_Overdue if currently Received
    for (const item of activeOverdue) {
      if (item.status === 'Received') {
        item.status = 'Desk_Overdue';
        await item.save();
      }
    }

    const formatted = activeOverdue.map(s => {
      const obj = s.toJSON();
      const minutesOverdue = Math.round((now.getTime() - new Date(obj.expected_return_time).getTime()) / 60000);
      return {
        ...obj,
        minutesOverdue
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
 * Get session by ID
 */
const getSessionById = async (req, res, next) => {
  try {
    const session = await BookInLibrarySession.findByPk(req.params.id, {
      include: [
        { model: BookCopy, as: 'bookCopy', include: [{ model: Book, as: 'book' }] },
        { model: User, as: 'receivedBy', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'returnedBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'In-library session not found' });
    }

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startSession,
  returnSession,
  getSessions,
  getOverdueSessions,
  getSessionById
};

