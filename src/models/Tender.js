import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js'; 

const Tender = sequelize.define('Tender', {
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
  expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  nit_doc: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  doc: {
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
  tableName: 'tenders',
  timestamps: true
});

export default Tender;