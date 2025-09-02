import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import Tender from "./Tender.js"

const Corrigendum = sequelize.define('Corrigendum', {
  // Fields similar to Tender
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
  cor_document: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  remarks:{
    type: DataTypes.TEXT,
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
  tenderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tenders', 
      key: 'id',
    }
  }
}, {
  tableName: 'corrigendums',
  timestamps: true,
});


Tender.hasMany(Corrigendum, { foreignKey: 'tenderId', as: 'corrigendums' });
// A Corrigendum belongs to exactly one Tender
Corrigendum.belongsTo(Tender, { foreignKey: 'tenderId', as: 'tender' });

export default Corrigendum;