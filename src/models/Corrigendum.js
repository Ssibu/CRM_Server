import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import Tender from "./Tender.js"

const Corrigendum = sequelize.define('Corrigendum', {
  // Fields similar to Tender
  en_title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  od_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  // The specific document for this corrigendum
  cor_document: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'File path for the corrigendum document',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_delete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // tenderId is the foreign key linking it to the Tender table
  tenderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tenders', // This should be the table name for Tenders
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