import { DataTypes } from 'sequelize';
// Adjust the path if your sequelize config is located elsewhere
import sequelize from '../../config/db.js';

const Footerlink = sequelize.define(
  'Footerlink',
  {
    englishLinkText: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // <-- ADDED: Prevents duplicate English link text
    },
    odiaLinkText: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // <-- ADDED: Prevents duplicate Odia link text
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // <-- ADDED: Prevents duplicate URLs
    },
    linkType: {
      type: DataTypes.ENUM('Internal', 'External'),
      allowNull: false,
      defaultValue: 'Internal',
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Active',
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'footerlinks', // Explicitly set the table name
    timestamps: true,
  }
);

export default Footerlink;