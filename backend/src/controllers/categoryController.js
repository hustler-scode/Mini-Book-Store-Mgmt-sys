const { Category, Book } = require('../models');

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Book, as: 'books', attributes: ['id', 'title'] }],
      order: [['name', 'ASC']]
    });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Book, as: 'books' }]
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    const existing = await Category.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }
    const category = await Category.create({ name, description });
    res.status(201).json({ success: true, message: 'Category created successfully', data: category });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const { name, description } = req.body;
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    await category.save();
    res.status(200).json({ success: true, message: 'Category updated successfully', data: category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    await category.destroy();
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

