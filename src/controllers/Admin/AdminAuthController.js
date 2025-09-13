
import models from '../../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import nodemailer from "nodemailer"
import { log } from '../../services/LogService.js';
import sequelize from '../../../config/db.js';
const{User, Page} = models

// Helper function to validate email format
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};


export const generateCaptcha = (req, res) => {


  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operator = '+';
  const answer = num1 + num2;

  req.session.captcha = answer;


  req.session.save((err) => {
    if (err) {
      console.error('Session save error:', err);
      return res.status(500).json({ error: 'Failed to save session.' });
    }

    res.status(200).json({ question: `${num1} ${operator} ${num2} = ?` });
  });
};
export const register = async (req, res) => {
  try {
    const { name, email, mobile } = req.body;
    const profilePicFile = req.file;

    // Check required fields including image
    if (!name || !email || !mobile || !profilePicFile) {
      return res.status(400).json({ error: 'All fields including image are required.' });
    }

    // Length validations based on model
    if (name.length > 50) {
      return res.status(400).json({ error: 'Name must not exceed 50 characters.' });
    }

    if (email.length > 100) {
      return res.status(400).json({ error: 'Email must not exceed 100 characters.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email must be a valid email address.' });
    }

    if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
      return res.status(400).json({ error: 'Mobile number must be exactly 10 digits and numeric.' });
    }

    // Check name length for password generation
    if (name.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters for password generation.' });
    }

    // Check duplicates
    const [existingEmail, existingMobile] = await Promise.all([
      User.findOne({ where: { email } }),
      User.findOne({ where: { mobile } }),
    ]);

    if (existingEmail) {
      return res.status(409).json({ error: 'Email already exists.' });
    }

    if (existingMobile) {
      return res.status(409).json({ error: 'Mobile number already exists.' });
    }

    // Generate password: first letter uppercase + second letter lowercase + '@' + last 5 digits of mobile
    const namePrefix = name.charAt(0).toUpperCase() + name.charAt(1).toLowerCase();
    const rawPassword = `${namePrefix}@${mobile.slice(-5)}`;

    // Check password length constraints
    if (rawPassword.length < 8 || rawPassword.length > 50) {
      return res.status(400).json({ error: 'Generated password must be between 8 and 50 characters.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Store filename of uploaded image
    const profilePic = profilePicFile.path ? path.basename(profilePicFile.path) : null;

    // Create user
    const newUser = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      profilePic,
      isAdmin: false,
    });

    // Log action (assuming log function exists)
    await log({
      req,
      action: 'CREATE',
      page_name: 'ADD USER',
      target: newUser.name,
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
    console.error('Register error:', error);

    if (error instanceof Sequelize.UniqueConstraintError) {
      const message = error.errors?.[0]?.message || 'Duplicate field';
      return res.status(409).json({ error: message });
    }

    return res.status(500).json({ error: 'Internal server error.' });
  }
};




// export const login = async (req, res) => {


//   try {
//     const { email, password, captcha } = req.body;

//     const sessionCaptcha = req.session.captcha;
 

//     if (!sessionCaptcha || sessionCaptcha != captcha) {
  
//       // Invalidate the captcha after an attempt
//       req.session.captcha = null;
//       return res.status(400).json({ error: 'Invalid CAPTCHA.' });
//     }



//     const user = await User.findOne({ where: { email } });

//     if (!user) {
//       return res.status(404).json({ error: 'Admin not found.' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: 'Invalid password.' });
//     }


//     const payload = {
//       id: user.id,
//       email: user.email,
//       isAdmin: user.isAdmin,
//     };

//     const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

//     res.cookie('__secure__token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 24 * 60 * 60 * 1000,
//     });
//        await log({
//         req,
//       user_id: payload.id,
//       action:"LOGIN",
//       page_name:"LOGIN",
//       // target:req.params.id,
//       target:user.name

      
  
//     });

//     return res.status(200).json({
//       message: 'Login successful.',
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         mobile: user.mobile,
//         isAdmin: user.isAdmin,
//       },
//     });

//   } catch (error) {
//     console.error('Login error:', error);
//     return res.status(500).json({ error: 'Internal server error.' });
//   }
// };

export const login = async (req, res) => {
  try {
    const { email, password, captcha } = req.body;
    const sessionCaptcha = req.session.captcha;

    if (!sessionCaptcha || sessionCaptcha != captcha) {
      req.session.captcha = null; // Invalidate captcha after attempt
      return res.status(400).json({ error: "Invalid CAPTCHA." });
    }

    // Find user with related pages
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Page,
          as: "pages",
          attributes: ["shortCode"],
          through: { attributes: [] },
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "Admin not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password." });
    }

    const payload = {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("__secure__token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    await log({
      req,
      user_id: payload.id,
      action: "LOGIN",
      page_name: "LOGIN",
      target: user.name,
    });

    // Convert to JSON to safely extract
    const userData = user.toJSON();

    // Extract permissions
    const permissions = userData.pages.map((page) => page.shortCode);

    // Remove pages before sending back
    delete userData.pages;

    return res.status(200).json({
      message: "Login successful.",
      user: {
        ...userData,
        permissions,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};


export const getLoggedInUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch user with associated pages
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "mobile", "profilePic", "isAdmin", "isActive"],
      include: [
        {
          model: Page,
          as: "pages",
          attributes: ["shortCode"], // only shortCode needed
          through: { attributes: [] }, // skip join table
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert to JSON
    const userData = user.toJSON();

    // Extract permissions from pages
    const permissions = userData.pages.map((page) => page.shortCode);

    // Remove pages before returning
    delete userData.pages;

    

    res.status(200).json({
      user: {
        ...userData,
        permissions, // add only permissions
      },
    });
  } catch (error) {
    console.error("Get logged-in user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const logout = async (req, res) => {
  res.clearCookie('__secure__token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  await log({
    req,
    user_id: req.user?.id,
    action: "LOGOUT",
    page_name: "LOGOUT",
    
  });
console.log(log)
  return res.status(200).json({ message: 'Logout successful.' });
};
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile } = req.body;
    const profilePicFile = req.file;

    // At least one field or image must be provided
    if (!name && !email && !mobile && !profilePicFile && req.body.profilePic === undefined) {
      return res.status(400).json({ error: 'At least one field or image file is required to update.' });
    }

    // Find the user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // === VALIDATIONS ===

    // Name length
    if (name && name.length > 50) {
      return res.status(400).json({ error: 'Name must not exceed 50 characters.' });
    }

    // Email format + length + uniqueness
    if (email) {
      if (email.length > 100) {
        return res.status(400).json({ error: 'Email must not exceed 100 characters.' });
      }
      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Email must be a valid email address.' });
      }

      if (email !== user.email) {
        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
          return res.status(409).json({ error: 'Email already exists.' });
        }
      }
    }

    // Mobile format + length + uniqueness
    if (mobile) {
      if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
        return res.status(400).json({ error: 'Mobile number must be exactly 10 digits and numeric.' });
      }

      if (mobile !== user.mobile) {
        const mobileExists = await User.findOne({ where: { mobile } });
        if (mobileExists) {
          return res.status(409).json({ error: 'Mobile number already exists.' });
        }
      }
    }

    // === UPDATES ===
    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;

    // === PROFILE PIC HANDLING ===

    // Remove profilePic if empty string is sent from frontend
    if (req.body.profilePic !== undefined) {
      if (req.body.profilePic === "") {
        // Delete existing file
        if (user.profilePic) {
          const oldFilePath = path.join(
            process.cwd(),
            'public',
            'uploads',
            'profiles',
            user.profilePic
          );

          fs.access(oldFilePath, fs.constants.F_OK, (err) => {
            if (!err) {
              fs.unlink(oldFilePath, (unlinkErr) => {
                if (unlinkErr) {
                  console.error('Error deleting old profile picture:', unlinkErr);
                }
              });
            }
          });
        }
        user.profilePic = null;
      }
    }

    // New profilePic uploaded
    if (profilePicFile) {
      user.profilePic = path.basename(profilePicFile.path);
    }

    await user.save();

    // Log update action
    await log({
      req,
      user_id: req.user?.id,
      action: 'UPDATE',
      page_name: 'EDIT USER',
      target: user.name,
    });

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

     await log({
      req,
      user_id: req.user.id,
      action: "DELETE",
      page_name: "MANAGE USER",
      target: req.params.id,
    });

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

    const data = user.toJSON();
    const filename = (data.profilePic || "").replace(/\\/g, "/");

    // Construct full URL assuming profile pics are served from /uploads/profiles/
    const profilePicUrl = filename
      ? `${req.protocol}://${req.get('host')}/uploads/profiles/${filename}`
      : null;

    const userWithProfilePicUrl = {
      ...data,
      profilePicUrl,
    };

    
     await log({
      req,
      user_id: req.user.id,
      action: "READ",
      page_name: "EDIT USER",
    });

    return res.status(200).json({ user: userWithProfilePicUrl });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const search = req.query.search || "";
    const sortBy = req.query.sort || "createdAt";
    const sortOrder = req.query.order || "DESC";
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const whereCondition = {
      id: { [Op.ne]: req.user.id }, // exclude current logged-in user
      ...(search && {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { mobile: { [Op.like]: `%${search}%` } },
        ],
      }),
    };

    const { count, rows } = await User.findAndCountAll({
      attributes: ['id', 'name', 'email', 'mobile', 'profilePic', 'isActive', 'createdAt'],
      where: whereCondition,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
    });

    // Map users to add full profile picture URL
    const usersWithProfilePicUrl = rows.map(user => {
      const data = user.toJSON();
      const filename = (data.profilePic || "").replace(/\\/g, "/");
      
      // Construct full URL assuming profile pics are served from /uploads/profiles/
      const profilePicUrl = filename
        ? `${req.protocol}://${req.get('host')}/uploads/profiles/${filename}`
        : null;

      return {
        ...data,
        profilePic_url: profilePicUrl,
      };
    });
    
     await log({
      req,
      action: "READ",
      page_name: "MANAGE USER",
            // target:req.params.id,

    });

    return res.status(200).json({
      total: count,
      data: usersWithProfilePicUrl,
    });

  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
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

     await log({
      req,
      action: "UPDATE",
      page_name: "MANAGE USER",
      target: user.name,
    });
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
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};
export const changeUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // === Validation: Presence ===
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide both current and new passwords." });
    }

    // === Validation: Length & Strength ===
    if (newPassword.length < 8 || newPassword.length > 100) {
      return res.status(400).json({ message: "Password must be of 8 characters" });
    }

    // === Validation: Password should not be same as current ===
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password must be different from the current password." });
    }

    // === Auth Check ===
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized." });
    }

    // === Fetch User ===
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // === Verify Current Password ===
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect current password." });
    }

    // === Hash and Update Password ===
    user.password = await hashPassword(newPassword);
    await user.save();

    // === Log the Password Change ===
    await log({
      req,
      action: "UPDATE",
      page_name: "CHANGE PASSWORD",
      target: user.name,
    });

    return res.status(200).json({ message: "Password updated successfully." });

  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ message: "Server error while changing password." });
  }
};
export const forgotPassword = async (req, res) => {
  try {
    const { email, captcha } = req.body;

    const sessionCaptcha = req.session.captcha;
    if (!sessionCaptcha || sessionCaptcha != captcha) {
      req.session.captcha = null;
      return res.status(400).json({ error: 'Invalid CAPTCHA.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });
    }

    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_RESET_SECRET,
      { expiresIn: '15m' } 
    );

    const resetUrl = `${process.env.CLIENT_ORIGIN}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
       port: parseInt(process.env.EMAIL_PORT, 10),
      secure: true, 
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
    },
    });

    await transporter.sendMail({
      from: `"CRM Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your Password Reset Link',
      html: `
        <p>You requested a password reset for your CRM account.</p>
        <p>Please click the link below to set a new password:</p>
        <p><a href="${resetUrl}" target="_blank">Reset Your Password</a></p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });
    

     await user.save();
          await log({
      req,
      // user_id: req.user.id,
      action: "UPDATE",
      page_name: "CHANGE PASSWORD",
      target: user.name,
          })

    return res.status(200).json({ message: 'If an account exists, a reset link has been sent.' });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
};
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password: newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ error: 'New password is required.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
        
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(400).json({ error: 'Invalid token. User not found.' });
        }

      
        const isSamePassword = await bcrypt.compare(newPassword, user.password);

        if (isSamePassword) {
            return res.status(400).json({ 
                error: 'Your new password cannot be the same as your current password.' 
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        await user.save();
          await log({
      req,
      // user_id: req.user.id,
      action: "UPDATE",
      page_name: "CHANGE PASSWORD",
      target: user.name,})


        res.status(200).json({ message: 'Password has been reset successfully.' });

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(400).json({ error: 'Password reset link has expired.' });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({ error: 'Invalid password reset link.' });
        }
        console.error('Reset Password Error:', error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
};