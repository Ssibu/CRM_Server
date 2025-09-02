import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js'; 

const Tender = sequelize.define('Notice', {
  en_title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique:true
  },
  od_title: {
    type: DataTypes.STRING,
    allowNull: true, 
    unique:true
  },
  date: {
    type: DataTypes.DATEONLY, 
    allowNull: false,
  },
 
  doc: {
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
  tableName: 'notices',
  timestamps: true,
    createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Tender;