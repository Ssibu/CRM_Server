import { DataTypes } from 'sequelize';
// Adjust the path if your sequelize config is located elsewhere
import sequelize from '../config/sequelize.js';

const Footerlink = sequelize.define(
  'Footerlink',
  {
    englishLinkText: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    odiaLinkText: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
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