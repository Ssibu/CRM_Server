import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js'; // Your sequelize instance

const ImportantLink = sequelize.define('ImportantLink', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'important_links',
  timestamps: true,
});

export default ImportantLink;

