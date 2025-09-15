// import { DataTypes } from 'sequelize';
// import sequelize from '../../config/db.js';
// import GalaryCategory from './GalleryCategory.js';

// const VideoGallery = sequelize.define('VideoGallery', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   category_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'galarycategories', // Ensure this matches the actual table name
//       key: 'id',
//     },
//     onDelete: 'CASCADE',
//   },
//   en_title: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   od_title: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   status: {
//     type: DataTypes.BOOLEAN,
//     allowNull: false,
//     defaultValue: true,
//   },
//   videotype: {
//     type: DataTypes.ENUM('file', 'link'),
//     allowNull: false,
//     defaultValue: 'file',
//   },
//   videofile: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   videolink: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
  
// }, {
//   tableName: 'video_galleries',
//   timestamps: true,
  
// });

// // Associations
// GalaryCategory.hasMany(VideoGallery, {
//   foreignKey: 'category_id',
//   as: 'videos',
// });
// VideoGallery.belongsTo(GalaryCategory, {
//   foreignKey: 'category_id',
//   as: 'category',
// });

// export default VideoGallery;

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
      model: 'galarycategories',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  en_title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      name: 'unique_en_title',
      msg: 'English title must be unique',
    },
    validate: {
      len: {
        args: [1, 100],
        msg: 'English title must be between 1 and 100 characters',
      },
    },
  },
  od_title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      name: 'unique_od_title',
      msg: 'Odia title must be unique',
    },
    validate: {
      len: {
        args: [1, 100],
        msg: 'Odia title must be between 1 and 100 characters',
      },
    },
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

GalaryCategory.hasMany(VideoGallery, {
  foreignKey: 'category_id',
  as: 'videos',
});
VideoGallery.belongsTo(GalaryCategory, {
  foreignKey: 'category_id',
  as: 'category',
});

export default VideoGallery;

