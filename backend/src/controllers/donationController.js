const { DonationRequest, Book, BookCopy, Category, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Submit a new book donation request
 */
const createDonationRequest = async (req, res, next) => {
  try {
    const {
      donor_name,
      donor_email,
      donor_phone,
      book_title,
      author,
      category_id,
      quantity,
      condition,
      requestremark,
      requestedbyid
    } = req.body;

    if (!donor_name || !book_title || !author) {
      return res.status(400).json({
        success: false,
        message: 'donor_name, book_title, and author are required'
      });
    }

    const effectiveRequestedById = requestedbyid || (req.user ? req.user.id : null);

    const donation = await DonationRequest.create({
      donor_name,
      donor_email,
      donor_phone,
      book_title,
      author,
      category_id: category_id || null,
      quantity: parseInt(quantity, 10) || 1,
      condition: condition || 'Good',
      status: 'requested',
      requestedbyid: effectiveRequestedById,
      requestedat: new Date(),
      requestremark
    });

    const result = await DonationRequest.findByPk(donation.id, {
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'requestedBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Donation request submitted successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all donation requests
 */
const getDonationRequests = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { donor_name: { [Op.iLike || Op.like]: `%${search}%` } },
        { book_title: { [Op.iLike || Op.like]: `%${search}%` } },
        { author: { [Op.iLike || Op.like]: `%${search}%` } }
      ];
    }

    const donations = await DonationRequest.findAll({
      where,
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'requestedBy', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'approvedBy', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'rejectedBy', attributes: ['id', 'name', 'email'] }
      ],
      order: [['id', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single donation request
 */
const getDonationRequestById = async (req, res, next) => {
  try {
    const donation = await DonationRequest.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'requestedBy', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'approvedBy', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'rejectedBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation request not found' });
    }

    res.status(200).json({ success: true, data: donation });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve donation request:
 * "during the donor approval period the book and book copy table will be created
 * automatically from the data found in this table"
 */
const approveDonationRequest = async (req, res, next) => {
  try {
    const donation = await DonationRequest.findByPk(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation request not found' });
    }

    if (donation.status === 'Approved') {
      return res.status(400).json({ success: false, message: 'Donation request is already approved' });
    }

    const { approvalremark, approvedbyid, category_id } = req.body;
    const effectiveApprovedById = approvedbyid || (req.user ? req.user.id : null);
    const effectiveCategoryId = category_id || donation.category_id;

    // 1. Find or create the Book
    let book = await Book.findOne({
      where: {
        title: donation.book_title,
        author: donation.author
      }
    });

    if (!book) {
      book = await Book.create({
        title: donation.book_title,
        author: donation.author,
        category_id: effectiveCategoryId || null
      });
    } else if (effectiveCategoryId && !book.category_id) {
      book.category_id = effectiveCategoryId;
      await book.save();
    }

    // 2. Automatically generate quantity BookCopy records
    const copies = [];
    const count = donation.quantity || 1;
    for (let i = 1; i <= count; i++) {
      const copyNumber = `BC-DON-${book.id}-${Date.now().toString().slice(-4)}-${i}`;
      const copy = await BookCopy.create({
        book_id: book.id,
        copy_number: copyNumber,
        condition: donation.condition || 'Good',
        source_type: 'Donation',
        status: 'Available'
      });
      copies.push(copy);
    }

    // 3. Mark DonationRequest as Approved
    donation.status = 'Approved';
    donation.approvedbyid = effectiveApprovedById;
    donation.approvedat = new Date();
    donation.approvalremark = approvalremark || 'Approved and inventory updated';
    if (effectiveCategoryId) donation.category_id = effectiveCategoryId;
    await donation.save();

    const updatedDonation = await DonationRequest.findByPk(donation.id, {
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'approvedBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: `Donation approved! Book registered and ${count} physical copy/copies added to inventory.`,
      data: {
        donation: updatedDonation,
        book,
        copies
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject donation request:
 * Records rejection details and marks status as Rejected
 */
const rejectDonationRequest = async (req, res, next) => {
  try {
    const donation = await DonationRequest.findByPk(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation request not found' });
    }

    const { rejectremark, rejectedbyid, remove_record } = req.body;
    const effectiveRejectedById = rejectedbyid || (req.user ? req.user.id : null);

    // If caller requests total removal per prompt requirement "during rejection also the record will be removed":
    if (remove_record === true || remove_record === 'true') {
      await donation.destroy();
      return res.status(200).json({
        success: true,
        message: 'Donation request rejected and removed completely.'
      });
    }

    donation.status = 'Rejected';
    donation.rejectedbyid = effectiveRejectedById;
    donation.rejectedat = new Date();
    donation.rejectremark = rejectremark || 'Rejected by staff';
    await donation.save();

    const updated = await DonationRequest.findByPk(donation.id, {
      include: [
        { model: User, as: 'rejectedBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Donation request marked as Rejected.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove donation record directly
 */
const deleteDonationRequest = async (req, res, next) => {
  try {
    const donation = await DonationRequest.findByPk(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation request not found' });
    }

    await donation.destroy();
    res.status(200).json({
      success: true,
      message: 'Donation request record removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDonationRequest,
  getDonationRequests,
  getDonationRequestById,
  approveDonationRequest,
  rejectDonationRequest,
  deleteDonationRequest
};

