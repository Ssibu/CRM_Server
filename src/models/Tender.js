import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js'; // Adjust path to your database config

const Tender = sequelize.define('Tender', {
  en_title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Title of the tender in English',
  },
  od_title: {
    type: DataTypes.STRING,
    allowNull: true, // Assuming Odia title can be optional
    comment: 'Title of the tender in Odia',
  },
  date: {
    type: DataTypes.DATEONLY, // Stores only the date without time
    allowNull: false,
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  nit_doc: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'File path for the NIT document',
  },
  doc: {
    type: DataTypes.STRING,
    allowNull: true, // Assuming this can be optional
    comment: 'File path for other tender documents',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_delete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // createdAt and updatedAt are handled automatically by Sequelize
}, {
  tableName: 'tenders',
  timestamps: true, // This enables createdAt and updatedAt
});

export default Tender;