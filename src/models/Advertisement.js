import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js'; 

const Advertisement = sequelize.define('Advertisement', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  en_adphoto: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Filename for the English advertisement image',
  },
  od_adphoto: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Filename for the Odia advertisement image',
  },
  ad_link: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Optional URL link for the advertisement',
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_delete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'advertisements', 
  timestamps: true,          
  underscored: true,       
});

export default Advertisement;