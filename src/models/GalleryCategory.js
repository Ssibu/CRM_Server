import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const GalaryCategory = sequelize.define('GalaryCategory', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  category_en: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category_od: {
    type: DataTypes.STRING,
    allowNull: false,
  },
category_type: {
  type: DataTypes.ENUM('photo', 'video'), // changed from 'image'
  allowNull: false,
},

  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'galarycategories',
  timestamps: true,
});

export default GalaryCategory;
