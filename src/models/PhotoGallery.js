import { DataTypes } from 'sequelize';

import sequelize from '../../config/db.js';
import GalaryCategory from './GalleryCategory.js';

const PhotoGallery = sequelize.define('PhotoGallery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'galarycategories',  // Make sure this matches your categories table name
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  title_en: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title_od: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,  // default to active
  },
}, {
  tableName: 'photo_galleries',
  timestamps: true,
});

// Associations
GalaryCategory.hasMany(PhotoGallery, { foreignKey: 'category_id', as: 'photos' });
PhotoGallery.belongsTo(GalaryCategory, { foreignKey: 'category_id', as: 'category' });

export default PhotoGallery;
