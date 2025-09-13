// import { DataTypes } from 'sequelize';
// import sequelize from '../../config/db.js'; 

// const Tender = sequelize.define('Tender', {
//   en_title: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique:true
//   },
//   od_title: {
//     type: DataTypes.STRING,
//     allowNull: true, 
//     unique:true
//   },
//   date: {
//     type: DataTypes.DATEONLY, 
//     allowNull: false,
//   },
//   expiry_date: {
//     type: DataTypes.DATEONLY,
//     allowNull: false,
//   },
//   nit_doc: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   doc: {
//     type: DataTypes.STRING,
//     allowNull: true, 
//   },
//   is_active: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: true,
//   },
//   is_delete: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false,
//   },
// }, {
//   tableName: 'tenders',
//   timestamps: true
// });

// export default Tender;


import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Tender = sequelize.define('Tender', {
  en_title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      len: {
        args: [1, 100],
        msg: 'English title must be between 1 and 100 characters',
      },
    },
  },
  od_title: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'Odia title must not exceed 100 characters',
      },
    },
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  nit_doc: {
    type: DataTypes.STRING(255),
    allowNull: true,
    // No explicit validation
  },
  doc: {
    type: DataTypes.STRING(255),
    allowNull: true,
    // No explicit validation
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_delete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'tenders',
  timestamps: true,
});

export default Tender;
