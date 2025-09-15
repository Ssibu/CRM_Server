// import { DataTypes } from 'sequelize';
// import sequelize from '../../config/db.js';

// const User = sequelize.define(
//   'user', 
//   {
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     email: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//       validate: {
//         isEmail: true,
//       },
//     },
//     mobile: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//     },
//     password: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     isAdmin: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//       defaultValue: false,
//     },
//     profilePic: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     isActive: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//       defaultValue: true,  
//     },
//   },
//   {
//     tableName: 'users',
//     timestamps: true, 
//   }
// );

// export default User;
// import { DataTypes } from 'sequelize';
// import sequelize from '../../config/db.js';

// const User = sequelize.define(
//   'user',
//   {
//     name: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//       validate: {
//         len: {
//           args: [0, 50],
//           msg: 'Name must not exceed 50 characters',
//         },
//       },
//     },
//     email: {
//       type: DataTypes.STRING(100),
//       allowNull: false,
//       unique: {
//         msg: 'Email already exists',
//       },
//       validate: {
//         isEmail: {
//           msg: 'Email must be a valid email address',
//         },
//         len: {
//           args: [0, 100],
//           msg: 'Email must not exceed 100 characters',
//         },
//       },
//     },
//     mobile: {
//       type: DataTypes.STRING(10),
//       allowNull: false,
//       unique: {
//         msg: 'Mobile number already exists',
//       },
//       validate: {
//         isNumeric: {
//           msg: 'Mobile number must contain only digits',
//         },
//         len: {
//           args: [0, 10],  // max 10 digits
//           msg: 'Mobile number must not exceed 10 digits',
//         },
//       },
//     },
//     password: {
//       type: DataTypes.STRING(50),
//       allowNull: false,
//       validate: {
//         len: {
//           args: [8, 255],  // max 50 characters
//           msg: 'Password must not exceed 50 characters',
//         },
//       },
//     },
//     isAdmin: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//       defaultValue: false,
//     },
//     profilePic: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     isActive: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//       defaultValue: true,
//     },
//   },
//   {
//     tableName: 'users',
//     timestamps: true,
//   }
// );

// export default User;
import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const User = sequelize.define(
  'user',
  {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: {
          args: [0, 50],
          msg: 'Name must not exceed 50 characters',
        },
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: 'Email already exists',
      },
      validate: {
        isEmail: {
          msg: 'Email must be a valid email address',
        },
        len: {
          args: [0, 100],
          msg: 'Email must not exceed 100 characters',
        },
      },
    },
    mobile: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: {
        msg: 'Mobile number already exists',
      },
      validate: {
        isNumeric: {
          msg: 'Mobile number must contain only digits',
        },
        len: {
          args: [0, 10],
          msg: 'Mobile number must not exceed 10 digits',
        },
      },
    },
    password: {
      type: DataTypes.STRING(255), // Store hashed password safely
      allowNull: false,
      // No length validation here — hashed passwords only!
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    profilePic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
  }
);

export default User;
