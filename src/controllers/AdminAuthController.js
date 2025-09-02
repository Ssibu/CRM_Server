// // Admin AUth COntroller update it 


// import User from '../models/User.js';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import { Op } from 'sequelize';



// // export const generateCaptcha = (req, res) => {
// //   const num1 = Math.floor(Math.random() * 10) + 1;
// //   const num2 = Math.floor(Math.random() * 10) + 1;
// //   const operator = '+'; 
// //   const answer = num1 + num2;

// //   req.session.captcha = answer;

// //   res.status(200).json({ question: `${num1} ${operator} ${num2} = ?` });
// // };

// export const generateCaptcha = (req, res) => {
//   console.log('--- [CAPTCHA GENERATION] ---');
//   console.log('Session ID:', req.sessionID); // Log the unique session identifier

//   const num1 = Math.floor(Math.random() * 10) + 1;
//   const num2 = Math.floor(Math.random() * 10) + 1;
//   const operator = '+';
//   const answer = num1 + num2;

//   // Store the answer in the session object
//   req.session.captcha = answer;

//   console.log('Generated CAPTCHA Answer:', answer);
//   console.log('Saving Answer to req.session.captcha');

//   // Manually save the session to be sure it's written before responding
//   req.session.save((err) => {
//     if (err) {
//       console.error('Session save error:', err);
//       return res.status(500).json({ error: 'Failed to save session.' });
//     }
//     console.log('Session saved successfully. Full session object:', req.session);
//     console.log('----------------------------\n');
//     res.status(200).json({ question: `${num1} ${operator} ${num2} = ?` });
//   });
// };

// export const register = async (req, res) => {
//   try {
//     const { name, email, mobile } = req.body;
//     const profilePicFile = req.file; // multer places uploaded file here

//     // Validate required fields and uploaded file
//     if (!name || !email || !mobile || !profilePicFile) {
//       return res.status(400).json({ error: 'All fields including image are required.' });
//     }

//     // Check if email already exists
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(409).json({ error: 'Email already exists.' });
//     }

//     // Check if mobile already exists
//     const existingMobile = await User.findOne({ where: { mobile } });
//     if (existingMobile) {
//       return res.status(409).json({ error: 'Mobile number already exists.' });
//     }

//     // Hash password dynamically (email + '123')
//     const rawPassword = `${email}123`;
//     const hashedPassword = await bcrypt.hash(rawPassword, 10);

//     // Use the path of the uploaded image file as profilePic
//     const profilePic = profilePicFile.path; // or construct a URL if you serve uploads statically

//     // Create new user
//     const newUser = await User.create({
//       name,
//       email,
//       mobile,
//       password: hashedPassword,
//       profilePic,
//       isAdmin: false,
//     });

//     return res.status(201).json({
//       message: 'User registered successfully.',
//       admin: {
//         id: newUser.id,
//         name: newUser.name,
//         email: newUser.email,
//         mobile: newUser.mobile,
//         isAdmin: newUser.isAdmin,
//       },
//     });
//   } catch (error) {
//     console.error('Signup error:', error);
//     return res.status(500).json({ error: 'Internal server error.' });
//   }
// };


// // export const login = async (req, res) => {

// //   try {
// //     const { email, password , captcha} = req.body;

// //     if (!email || !password ) {
// //       return res.status(400).json({ error: 'Email and password are required.' });
// //     }

// //   if(!captcha){
// //     return res.status(400).json({message: "CAPTCHA is required."})
// //   }
     

// //     if (parseInt(captcha, 10) !== req.session.captcha) {
// //       // Invalidate the captcha after an attempt
// //       req.session.captcha = null;
// //       return res.status(400).json({ error: 'Invalid CAPTCHA.' });
// //     }

// //     // Invalidate the captcha after a successful attempt
// //     req.session.captcha = null;


// //     const user = await User.findOne({ where: { email } });

// //     if (!user) {
// //       return res.status(404).json({ error: 'Admin not found.' });
// //     }

// //     const isMatch = await bcrypt.compare(password, user.password);
// //     if (!isMatch) {
// //       return res.status(401).json({ error: 'Invalid password.' });
// //     }

// //     if (!process.env.JWT_SECRET) {
// //       console.error('JWT_SECRET is NOT defined!');
// //       return res.status(500).json({ error: 'JWT_SECRET environment variable not set' });
// //     }

// //     const payload = {
// //       id: user.id,
// //       email: user.email,
// //       isAdmin: user.isAdmin,
// //     };

// //     const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

// //     res.cookie('token', token, {
// //       httpOnly: true,
// //       secure: process.env.NODE_ENV === 'production',
// //       sameSite: 'strict',
// //       maxAge: 24 * 60 * 60 * 1000,
// //     });

// //     return res.status(200).json({
// //       message: 'Login successful.',
// //       user: {
// //         id: user.id,
// //         name: user.name,
// //         email: user.email,
// //         mobile: user.mobile,
// //         isAdmin: user.isAdmin,
// //       },
// //     });

// //   } catch (error) {
// //     console.error('Login error:', error);
// //     return res.status(500).json({ error: 'Internal server error.' });
// //   }
// // };


// export const login = async (req, res) => {
//   console.log('--- [LOGIN ATTEMPT] ---');
//   console.log('Session ID:', req.sessionID); // Log session ID again. Is it the same?
//   console.log('Full session object on arrival:', req.session); // What does the session contain?

//   try {
//     const { email, password, captcha } = req.body;
//     console.log('Received Payload:', req.body);

//     const sessionCaptcha = req.session.captcha;
//     console.log('Retrieved from session (req.session.captcha):', sessionCaptcha, `(Type: ${typeof sessionCaptcha})`);
//     console.log('User-submitted captcha:', captcha, `(Type: ${typeof captcha})`);

//     // We use '==' to be lenient with types (e.g., '11' vs 11), though strict is better.
//     // Let's log the strict comparison result.
//     console.log('Strict comparison (session === user):', sessionCaptcha === parseInt(captcha, 10));
//     console.log('Lenient comparison (session == user):', sessionCaptcha == captcha);

//     if (!sessionCaptcha || sessionCaptcha != captcha) {
//       console.log('!!! CAPTCHA VALIDATION FAILED !!!');
//       console.log('-------------------------\n');

//       // Invalidate the captcha after an attempt
//       req.session.captcha = null;
//       return res.status(400).json({ error: 'Invalid CAPTCHA.' });
//     }

//     console.log('✅ CAPTCHA Validation Succeeded.');


//     const user = await User.findOne({ where: { email } });

//     if (!user) {
//       return res.status(404).json({ error: 'Admin not found.' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: 'Invalid password.' });
//     }

//     if (!process.env.JWT_SECRET) {
//       console.error('JWT_SECRET is NOT defined!');
//       return res.status(500).json({ error: 'JWT_SECRET environment variable not set' });
//     }

//     const payload = {
//       id: user.id,
//       email: user.email,
//       isAdmin: user.isAdmin,
//     };

//     const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

//     res.cookie('token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 24 * 60 * 60 * 1000,
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


// export const getLoggedInUser = (req, res) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ message: 'Unauthorized' });
//     }

//     // Return user info (from JWT payload)
//     res.status(200).json({ user: req.user });
//   } catch (error) {
//     console.error('Get logged-in user error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


// export const logout = (req, res) => {
//   res.clearCookie('token', {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'strict',
//   });

//   return res.status(200).json({ message: 'Logout successful.' });
// };

// export const updateUser = async (req, res) => {
//   try {
//     const { id } = req.params; // user ID from route param
//     const { name, email, mobile } = req.body;
//     const profilePicFile = req.file; // multer file if uploaded

//     // At least one field or file should be provided
//     if (!name && !email && !mobile && !profilePicFile) {
//       return res.status(400).json({ error: 'At least one field or image file is required to update.' });
//     }

//     // Find user by id
//     const user = await User.findByPk(id);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found.' });
//     }

//     // Check if email is being updated and if it already exists for another user
//     if (email && email !== user.email) {
//       const emailExists = await User.findOne({ where: { email } });
//       if (emailExists) {
//         return res.status(409).json({ error: 'Email already exists.' });
//       }
//     }

//     // Check if mobile is being updated and if it already exists for another user
//     if (mobile && mobile !== user.mobile) {
//       const mobileExists = await User.findOne({ where: { mobile } });
//       if (mobileExists) {
//         return res.status(409).json({ error: 'Mobile number already exists.' });
//       }
//     }

//     // Update fields dynamically
//     if (name) user.name = name;
//     if (email) user.email = email;
//     if (mobile) user.mobile = mobile;
//     if (profilePicFile) {
//       user.profilePic = profilePicFile.path; // Or construct a URL if needed
//     }

//     await user.save();

//     return res.status(200).json({
//       message: 'User updated successfully.',
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         mobile: user.mobile,
//         profilePic: user.profilePic,
//         isAdmin: user.isAdmin,
//       },
//     });
//   } catch (error) {
//     console.error('Update user error:', error);
//     return res.status(500).json({ error: 'Internal server error.' });
//   }
// };



// export const deleteUser = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Find user by id
//     const user = await User.findByPk(id);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found.' });
//     }

//     // Delete user
//     await user.destroy();

//     return res.status(200).json({ message: 'User deleted successfully.' });
//   } catch (error) {
//     console.error('Delete user error:', error);
//     return res.status(500).json({ error: 'Internal server error.' });
//   }
// };

// export const getUserById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const user = await User.findByPk(id, {
//       attributes: ['id', 'name', 'email', 'mobile', 'profilePic', 'isActive', 'isAdmin']
//     });

//     if (!user) {
//       return res.status(404).json({ error: 'User not found.' });
//     }

//     return res.status(200).json({ user });
//   } catch (error) {
//     console.error('Get user by ID error:', error);
//     return res.status(500).json({ error: 'Internal server error.' });
//   }
// };

// export const getAllUsers = async (req, res) => {
//   try {
//     const search = req.query.search || "";
    
//     // The hook sends `sort` and `order`, not `sortBy`.
//     const sortBy = req.query.sort || "createdAt";
//     const sortOrder = req.query.order || "DESC";

//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 10;
//     const offset = (page - 1) * limit;

//     const whereCondition = {
//       // It's good practice to exclude the currently logged-in admin from the list
//       id: { [Op.ne]: req.user.id },
//       ...(search && {
//           [Op.or]: [
//             { name: { [Op.like]: `%${search}%` } },
//             { email: { [Op.like]: `%${search}%` } },
//             { mobile: { [Op.like]: `%${search}%` } },
//           ],
//       })
//     };

//     // Use findAndCountAll to get both the rows and the total count in one query
//     const { count, rows } = await User.findAndCountAll({
//       attributes: ['id', 'name', 'email', 'mobile', 'profilePic', 'isActive'],
//       where: whereCondition,
//       order: [[sortBy, sortOrder.toUpperCase()]],
//       limit,
//       offset,
//     });

 
//     return res.status(200).json({
//       total: count,
//       data: rows,
//     });

//   } catch (error)
//   {
//     console.error('Get all users error:', error);
//     return res.status(500).json({ error: 'Internal server error.' });
//   }
// };

// //update status controller
// export const toggleUserStatus = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const user = await User.findByPk(id);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     user.isActive = !user.isActive; // Toggle status
//     await user.save();

//     res.status(200).json({
//       message: `User status changed to ${user.isActive ? 'Active' : 'Inactive'}`,
//       user,
//     });
//   } catch (error) {
//     console.error('Error toggling user status:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


// export const getAllAdmins = async (req, res) => {
//   try {
//     const admins = await User.findAll({
//       where: { isAdmin: true },
//       attributes: { exclude: ['password'] }, // exclude sensitive data like password
//       order: [['createdAt', 'DESC']], // optional: order by creation date descending
//     });

//     return res.status(200).json({ admins });
//   } catch (error) {
//     console.error('Error fetching admins:', error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

// const hashPassword = async (password) => {
//     const salt = await bcrypt.genSalt(10);
//     return await bcrypt.hash(password, salt);
// };



// export const changeUserPassword = async (req, res) => {
//     try {
//         const { currentPassword, newPassword } = req.body;

//         if (!currentPassword || !newPassword) {
//             return res.status(400).json({ message: "Please provide both current and new passwords." });
//         }
        
//         if (!req.user) {
//             return res.status(401).json({ message: "Not authorized." });
//         }

//         const user = await User.findByPk(req.user.id);
//         console.log(user)
        
//         if (!user) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         const isMatch = await bcrypt.compare(currentPassword, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ message: "Incorrect current password." });
//         }
        
//         user.password = await hashPassword(newPassword);
//         await user.save();

//         res.status(200).json({ message: "Password updated successfully." });

//     } catch (error) {
//         console.error("Error changing password:", error);
//         res.status(500).json({ message: "Server error while changing password." });
//     }
// }





// Admin AUth COntroller update it 


import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import path from 'path';


// export const generateCaptcha = (req, res) => {
//   const num1 = Math.floor(Math.random() * 10) + 1;
//   const num2 = Math.floor(Math.random() * 10) + 1;
//   const operator = '+'; 
//   const answer = num1 + num2;

//   req.session.captcha = answer;

//   res.status(200).json({ question: `${num1} ${operator} ${num2} = ?` });
// };

export const generateCaptcha = (req, res) => {
  console.log('--- [CAPTCHA GENERATION] ---');
  console.log('Session ID:', req.sessionID); // Log the unique session identifier

  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operator = '+';
  const answer = num1 + num2;

  // Store the answer in the session object
  req.session.captcha = answer;

  console.log('Generated CAPTCHA Answer:', answer);
  console.log('Saving Answer to req.session.captcha');

  // Manually save the session to be sure it's written before responding
  req.session.save((err) => {
    if (err) {
      console.error('Session save error:', err);
      return res.status(500).json({ error: 'Failed to save session.' });
    }
    console.log('Session saved successfully. Full session object:', req.session);
    console.log('----------------------------\n');
    res.status(200).json({ question: `${num1} ${operator} ${num2} = ?` });
  });
};


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

    // Save only the filename of the uploaded file, not the full path
    const profilePic = profilePicFile.path
      ? path.basename(profilePicFile.path)
      : null;

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


// export const login = async (req, res) => {

//   try {
//     const { email, password , captcha} = req.body;

//     if (!email || !password ) {
//       return res.status(400).json({ error: 'Email and password are required.' });
//     }

//   if(!captcha){
//     return res.status(400).json({message: "CAPTCHA is required."})
//   }
     

//     if (parseInt(captcha, 10) !== req.session.captcha) {
//       // Invalidate the captcha after an attempt
//       req.session.captcha = null;
//       return res.status(400).json({ error: 'Invalid CAPTCHA.' });
//     }

//     // Invalidate the captcha after a successful attempt
//     req.session.captcha = null;


//     const user = await User.findOne({ where: { email } });

//     if (!user) {
//       return res.status(404).json({ error: 'Admin not found.' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: 'Invalid password.' });
//     }

//     if (!process.env.JWT_SECRET) {
//       console.error('JWT_SECRET is NOT defined!');
//       return res.status(500).json({ error: 'JWT_SECRET environment variable not set' });
//     }

//     const payload = {
//       id: user.id,
//       email: user.email,
//       isAdmin: user.isAdmin,
//     };

//     const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

//     res.cookie('token', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 24 * 60 * 60 * 1000,
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
  console.log('--- [LOGIN ATTEMPT] ---');
  console.log('Session ID:', req.sessionID); // Log session ID again. Is it the same?
  console.log('Full session object on arrival:', req.session); // What does the session contain?

  try {
    const { email, password, captcha } = req.body;
    console.log('Received Payload:', req.body);

    const sessionCaptcha = req.session.captcha;
    console.log('Retrieved from session (req.session.captcha):', sessionCaptcha, `(Type: ${typeof sessionCaptcha})`);
    console.log('User-submitted captcha:', captcha, `(Type: ${typeof captcha})`);

    // We use '==' to be lenient with types (e.g., '11' vs 11), though strict is better.
    // Let's log the strict comparison result.
    console.log('Strict comparison (session === user):', sessionCaptcha === parseInt(captcha, 10));
    console.log('Lenient comparison (session == user):', sessionCaptcha == captcha);

    if (!sessionCaptcha || sessionCaptcha != captcha) {
      console.log('!!! CAPTCHA VALIDATION FAILED !!!');
      console.log('-------------------------\n');

      // Invalidate the captcha after an attempt
      req.session.captcha = null;
      return res.status(400).json({ error: 'Invalid CAPTCHA.' });
    }

    console.log('✅ CAPTCHA Validation Succeeded.');


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
      // Save only the filename, not the full path
      user.profilePic = path.basename(profilePicFile.path);
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

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Please provide both current and new passwords." });
        }
        
        if (!req.user) {
            return res.status(401).json({ message: "Not authorized." });
        }

        const user = await User.findByPk(req.user.id);
        console.log(user)
        
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect current password." });
        }
        
        user.password = await hashPassword(newPassword);
        await user.save();

        res.status(200).json({ message: "Password updated successfully." });

    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Server error while changing password." });
    }
}