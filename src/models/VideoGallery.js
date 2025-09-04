import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import GalaryCategory from './GalleryCategory.js';

const VideoGallery = sequelize.define('VideoGallery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'galarycategories', // Ensure this matches the actual table name
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
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  videotype: {
    type: DataTypes.ENUM('file', 'link'),
    allowNull: false,
    defaultValue: 'file',
  },
  videofile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  videolink: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
}, {
  tableName: 'video_galleries',
  timestamps: true,
  
});

// Associations
GalaryCategory.hasMany(VideoGallery, {
  foreignKey: 'category_id',
  as: 'videos',
});
VideoGallery.belongsTo(GalaryCategory, {
  foreignKey: 'category_id',
  as: 'category',
});

export default VideoGallery;
