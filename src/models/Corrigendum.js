import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import Tender from "./Tender.js"

const Corrigendum = sequelize.define('Corrigendum', {
 
  cor_document: {
    type: DataTypes.STRING,
    allowNull: true,
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
Corrigendum.belongsTo(Tender, { foreignKey: 'tenderId', as: 'tender' });

export default Corrigendum;