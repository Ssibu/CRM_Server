// models/HomepageBanner.js
import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js'; // Adjust this path as needed based on your project structure

const HomepageBanner = sequelize.define('HomepageBanner', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  banner: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'home_page_banners',
  timestamps: false,
  underscored: true,
});

export default HomepageBanner;
