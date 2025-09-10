import { DataTypes } from 'sequelize';
// Adjust the path if your sequelize config is located elsewhere
import sequelize from '../../config/db.js';

const Footerlink = sequelize.define(
  'Footerlink',
  {
    en_link_text: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true 
    },
    od_link_text: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true 
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true 
    },
    linkType: {
      type: DataTypes.ENUM('UsefulLink', 'ImportantLink'),
      allowNull: false,
      defaultValue: 'UsefulLink',
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
    tableName: 'footerlinks', 
    timestamps: true,
  }
);

export default Footerlink;