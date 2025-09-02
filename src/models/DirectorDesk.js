import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const DirectorDesk = sequelize.define('DirectorDesk', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  en_title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  od_title: {
    type: DataTypes.TEXT,
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
    allowNull: true,
  },
  od_designation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  en_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  od_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  director_img: { 
    type: DataTypes.STRING,
    allowNull: true,
  },
  department_img: { 
    type: DataTypes.STRING,
    allowNull: true,
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
  tableName: 'director_desk', 
  timestamps: true,
  underscored: true, 
});

export default DirectorDesk;