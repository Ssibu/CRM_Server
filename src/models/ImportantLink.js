import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js'; // Your sequelize instance

const ImportantLink = sequelize.define('ImportantLink', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      // isUrl: true,
      notEmpty: true
    }
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'important_links',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default ImportantLink;