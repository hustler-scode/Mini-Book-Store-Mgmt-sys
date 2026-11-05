const { User, Role } = require('../models');
const { generateToken } = require('../middlewares/auth');

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone_number, isstaff, isvisitor, status, RoleId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Default to 'Member' role if none provided
    let targetRoleId = RoleId;
    if (!targetRoleId) {
      const defaultRole = await Role.findOne({
        where: { Rolename: isstaff ? 'Staff' : (isvisitor ? 'Visitor' : 'Member') }
      });
      if (defaultRole) targetRoleId = defaultRole.id;
    }

    const newUser = await User.create({
      name,
      email,
      password,
      phone_number,
      isstaff: isstaff || false,
      isvisitor: isvisitor || false,
      status: status || 'Active',
      RoleId: targetRoleId
    });

    const token = generateToken(newUser);
    const userSafe = await User.findByPk(newUser.id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] }
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      data: userSafe
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ success: false, message: `Account is ${user.status}. Please contact staff.` });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const userJson = user.toJSON();
    delete userJson.password;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: userJson
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get profile of authenticated user
 */
const me = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(200).json({
        success: true,
        message: 'No authenticated user session found (running in permissive mode)',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all available roles
 */
const getRoles = async (req, res, next) => {
  try {
    const roles = await Role.findAll();
    return res.status(200).json({
      success: true,
      data: roles
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  me,
  getRoles
};

