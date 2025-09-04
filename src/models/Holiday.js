import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Holiday = sequelize.define('Holiday', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  holiday_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('National', 'Gazetted', 'Restricted', 'State-Specific'),
    allowNull: false,
    comment: 'The type of holiday',
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
  tableName: 'holidays',
  timestamps: true,
    underscored: true,     
});

export default Holiday;