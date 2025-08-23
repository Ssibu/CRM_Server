import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET

export const register = async (req, res) => {
  try {
    const { name, email, mobile, profilePic } = req.body;

    // Validate required fields (no password here)
    if (!name || !email || !mobile || !profilePic) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists.' });
    }

    const existingMobile = await User.findOne({ where: { mobile } });
    if (existingMobile) {
      return res.status(409).json({ error: 'Mobile number already exists.' });
    }

    // Dynamically create password as name + '123'
    const rawPassword = `${email}123`;

    // Hash password
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Create new admin user
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

    const payload = {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

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


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'mobile', 'profilePic', 'isActive'],
    });

    return res.status(200).json({
      message: 'Users fetched successfully.',
      users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
