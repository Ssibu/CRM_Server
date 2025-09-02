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
      model: 'galarycategories',  // make sure it matches your categories table name
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
  video: {   // similar to photo but for video file/url
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,  // default to active
  },
}, {
  tableName: 'video_galleries',  // separate table name for videos
  timestamps: true,
});

// Associations
GalaryCategory.hasMany(VideoGallery, { foreignKey: 'category_id', as: 'videos' });
VideoGallery.belongsTo(GalaryCategory, { foreignKey: 'category_id', as: 'category' });

export default VideoGallery;
