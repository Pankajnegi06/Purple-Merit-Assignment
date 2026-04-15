const User = require('../models/User');
const { ROLES } = require('../config/roles');

/**
 * GET /api/users
 * Admin & Manager: paginated, searchable, filterable user list
 */
exports.getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      status = '',
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const filter = {};

    // Search by name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by role
    if (role) {
      filter.role = role;
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Manager cannot see admin users
    if (req.user.role === ROLES.MANAGER) {
      filter.role = { $ne: ROLES.ADMIN };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email'),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 */
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Manager cannot view admin users
    if (req.user.role === ROLES.MANAGER && user.role === ROLES.ADMIN) {
      return res.status(403).json({ message: 'Forbidden. Cannot view admin user details.' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users
 * Admin only
 */
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, status } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      status: status || 'active',
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    res.status(201).json({ message: 'User created successfully.', user });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id
 * Admin: can update anything
 * Manager: can update non-admin users (no role change)
 * User: can update own profile (name, password only)
 */
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const currentUserRole = req.user.role;
    const isOwnProfile = req.user._id.toString() === req.params.id;

    // Regular user can only update own profile
    if (currentUserRole === ROLES.USER && !isOwnProfile) {
      return res.status(403).json({ message: 'You can only update your own profile.' });
    }

    // Manager restrictions
    if (currentUserRole === ROLES.MANAGER) {
      if (user.role === ROLES.ADMIN) {
        return res.status(403).json({ message: 'Forbidden. Cannot update admin users.' });
      }
      // Manager cannot change roles
      if (req.body.role && req.body.role !== user.role) {
        return res.status(403).json({ message: 'Forbidden. Managers cannot change user roles.' });
      }
    }

    // Regular user cannot change their own role or status
    if (currentUserRole === ROLES.USER) {
      delete req.body.role;
      delete req.body.status;
    }

    // Update allowed fields
    const { name, email, password, role, status } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    if (role && currentUserRole === ROLES.ADMIN) user.role = role;
    if (status && currentUserRole === ROLES.ADMIN) user.status = status;
    user.updatedBy = req.user._id;

    await user.save();

    res.json({ message: 'User updated successfully.', user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id
 * Admin only — soft delete (set status to inactive)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'Cannot deactivate your own account.' });
    }

    user.status = 'inactive';
    user.updatedBy = req.user._id;
    await user.save();

    res.json({ message: 'User deactivated successfully.', user });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/profile/me
 * Any authenticated user — view own profile
 */
exports.getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/profile/me
 * Any authenticated user — update own profile (name, password only)
 */
exports.updateMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const { name, password } = req.body;

    if (name) user.name = name;
    if (password) user.password = password;
    user.updatedBy = req.user._id;

    await user.save();
    res.json({ message: 'Profile updated successfully.', user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};
