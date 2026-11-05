const { Supplier, PurchaseRecord } = require('../models');

const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.findAll({
      include: [{ model: PurchaseRecord, as: 'purchases', attributes: ['id', 'purchase_date', 'total_cost', 'status'] }],
      order: [['id', 'DESC']]
    });
    res.status(200).json({ success: true, count: suppliers.length, data: suppliers });
  } catch (error) {
    next(error);
  }
};

const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id, {
      include: [{ model: PurchaseRecord, as: 'purchases' }]
    });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.status(200).json({ success: true, data: supplier });
  } catch (error) {
    next(error);
  }
};

const createSupplier = async (req, res, next) => {
  try {
    const { name, person_fullname, phone, email, address } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Supplier name is required' });
    }
    const supplier = await Supplier.create({
      name,
      person_fullname,
      phone,
      email,
      address
    });
    res.status(201).json({ success: true, message: 'Supplier registered successfully', data: supplier });
  } catch (error) {
    next(error);
  }
};

const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    const { name, person_fullname, phone, email, address } = req.body;
    if (name) supplier.name = name;
    if (person_fullname !== undefined) supplier.person_fullname = person_fullname;
    if (phone !== undefined) supplier.phone = phone;
    if (email !== undefined) supplier.email = email;
    if (address !== undefined) supplier.address = address;

    await supplier.save();
    res.status(200).json({ success: true, message: 'Supplier updated successfully', data: supplier });
  } catch (error) {
    next(error);
  }
};

const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    await supplier.destroy();
    res.status(200).json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};

