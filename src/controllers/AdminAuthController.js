// Admin AUth COntroller update it 


import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

export const register = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;
    const profilePicFile = req.file; // multer places uploaded file here

    // Validate required fields and uploaded file
    if (!name || !email || !mobile || !profilePicFile) {
      return res.status(400).json({ error: 'All fields including image are required.' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists.' });
    }

    // Check if mobile already exists
    const existingMobile = await User.findOne({ where: { mobile } });
    if (existingMobile) {
      return res.status(409).json({ error: 'Mobile number already exists.' });
    }

    // Hash password dynamically (email + '123')
    const rawPassword = `${email}123`;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Use the path of the uploaded image file as profilePic
    const profilePic = profilePicFile.path; // or construct a URL if you serve uploads statically

    // Create new user
    const newUser = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      profilePic,
      isAdmin: false,
    });

    return res.status(201).json({
      message: 'User registered successfully.',
      admin: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'Admin not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is NOT defined!');
      return res.status(500).json({ error: 'JWT_SECRET environment variable not set' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    // Use process.env.JWT_SECRET directly here
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: 'Login successful.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        isAdmin: user.isAdmin,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};


export const getLoggedInUser = (req, res) => {
  try {
    // req.user is set by authMiddleware if token is valid
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Return user info (from JWT payload)
    res.status(200).json({ user: req.user });
  } catch (error) {
    console.error('Get logged-in user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return res.status(200).json({ message: 'Logout successful.' });
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params; // user ID from route param
    const { name, email, mobile } = req.body;
    const profilePicFile = req.file; // multer file if uploaded

    // At least one field or file should be provided
    if (!name && !email && !mobile && !profilePicFile) {
      return res.status(400).json({ error: 'At least one field or image file is required to update.' });
    }

    // Find user by id
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if email is being updated and if it already exists for another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(409).json({ error: 'Email already exists.' });
      }
    }

    // Check if mobile is being updated and if it already exists for another user
    if (mobile && mobile !== user.mobile) {
      const mobileExists = await User.findOne({ where: { mobile } });
      if (mobileExists) {
        return res.status(409).json({ error: 'Mobile number already exists.' });
      }
    }

    // Update fields dynamically
    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;
    if (profilePicFile) {
      user.profilePic = profilePicFile.path; // Or construct a URL if needed
    }

    await user.save();

    return res.status(200).json({
      message: 'User updated successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        profilePic: user.profilePic,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};



export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user by id
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Delete user
    await user.destroy();

    return res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'mobile', 'profilePic', 'isActive', 'isAdmin']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // 🔍 1. Searching
    const search = req.query.search || "";

    // ⬆️⬇️ 2. Sorting
    const sortBy = req.query.sortBy || "createdAt"; // fallback if sort param missing
    const order = req.query.order === "desc" ? "DESC" : "ASC";

    // 📄 3. Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // 🛠️ 4. Where condition for search
    const whereCondition = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { mobile: { [Op.like]: `%${search}%` } },
      ],
    };

    // 🔢 5. Get total count for frontend pagination
    const totalCount = await User.count({ where: whereCondition });

    // 🚀 6. Fetch filtered/sorted/paginated users
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'mobile', 'profilePic', 'isActive'],
      where: whereCondition,
      order: [[sortBy, order]],
      limit,
      offset,
    });

    // ✅ 7. Send response
    return res.status(200).json({
      message: 'Users fetched successfully.',
      users,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });

  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// export const getAllUsers = async (req, res) => {
//   try {
//     const users = await User.findAll({
//       attributes: ['id', 'name', 'email', 'mobile', 'profilePic', 'isActive'],
//     });

//     return res.status(200).json({
//       message: 'Users fetched successfully.',
//       users,
//     });
//   } catch (error) {
//     console.error('Get all users error:', error);
//     return res.status(500).json({ error: 'Internal server error.' });
//   }
// };


//update status controller
export const toggleUserStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive; // Toggle status
    await user.save();

    res.status(200).json({
      message: `User status changed to ${user.isActive ? 'Active' : 'Inactive'}`,
      user,
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: { isAdmin: true },
      attributes: { exclude: ['password'] }, // exclude sensitive data like password
      order: [['createdAt', 'DESC']], // optional: order by creation date descending
    });

    return res.status(200).json({ admins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};