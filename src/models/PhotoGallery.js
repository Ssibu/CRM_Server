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
      model: 'galarycategories',  // Ensure this matches your actual table name
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  en_title: {
    type: DataTypes.STRING(101),
    allowNull: false,
  },
  od_title: {
    type: DataTypes.STRING(101),
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  phototype: {
    type: DataTypes.ENUM('file', 'link'),
    allowNull: false,
    defaultValue: 'file',
  },
  photofile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  photolink: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'photo_galleries',
  timestamps: true,
});

// Associations
GalaryCategory.hasMany(PhotoGallery, {
  foreignKey: 'category_id',
  as: 'photos',
});
PhotoGallery.belongsTo(GalaryCategory, {
  foreignKey: 'category_id',
  as: 'category',
});

export default PhotoGallery;
