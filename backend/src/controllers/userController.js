const { User, Role } = require('../models');

const getUsers = async (req, res, next) => {
  try {
    const { status, isstaff, isvisitor } = req.query;
    const where = {};
    if (status) where.status = status;
    if (isstaff !== undefined) where.isstaff = isstaff === 'true';
    if (isvisitor !== undefined) where.isvisitor = isvisitor === 'true';

    const users = await User.findAll({
      where,
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] },
      order: [['id', 'DESC']]
    });

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone_number, isstaff, isvisitor, status, RoleId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      phone_number,
      isstaff: isstaff || false,
      isvisitor: isvisitor || false,
      status: status || 'Active',
      RoleId: RoleId || null
    });

    const userSafe = await User.findByPk(newUser.id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] }
    });

    res.status(201).json({ success: true, message: 'User created successfully', data: userSafe });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, email, phone_number, isstaff, isvisitor, status, RoleId, password } = req.body;

    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email is already in use by another account' });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (phone_number !== undefined) user.phone_number = phone_number;
    if (isstaff !== undefined) user.isstaff = isstaff;
    if (isvisitor !== undefined) user.isvisitor = isvisitor;
    if (status) user.status = status;
    if (RoleId !== undefined) user.RoleId = RoleId;
    if (password) user.password = password;

    await user.save();

    const updated = await User.findByPk(user.id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({ success: true, message: 'User updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await user.destroy();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};

