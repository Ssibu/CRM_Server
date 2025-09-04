import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const HomeAdmin = sequelize.define('HomeAdmin', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  en_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  od_name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  en_designation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  od_designation: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
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
  tableName: 'home_admins',
  timestamps: true,
  underscored: true, 
});

export default HomeAdmin;