import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js'; 

const HomeSetting = sequelize.define('HomeSetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  en_org_name: { type: DataTypes.TEXT, allowNull: true },
  od_org_name: { type: DataTypes.TEXT, allowNull: true },
  en_person_designation: { type: DataTypes.TEXT, allowNull: true },
  od_person_designation: { type: DataTypes.TEXT, allowNull: true },
  en_person_name: { type: DataTypes.TEXT, allowNull: true },
  od_person_name: { type: DataTypes.TEXT, allowNull: true },
  en_overview_description: { type: DataTypes.TEXT, allowNull: true },
  od_overview_description: { type: DataTypes.TEXT, allowNull: true },
  en_address: { type: DataTypes.TEXT, allowNull: true },
  od_address: { type: DataTypes.TEXT, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
  mobileNumber: { type: DataTypes.STRING, allowNull: true },
  facebookLink: { type: DataTypes.STRING, allowNull: true },
  twitterLink: { type: DataTypes.STRING, allowNull: true },
  instagramLink: { type: DataTypes.STRING, allowNull: true },
  linkedinLink: { type: DataTypes.STRING, allowNull: true },
  odishaLogo: { type: DataTypes.STRING, allowNull: true },
  cmPhoto: { type: DataTypes.STRING, allowNull: true },   
  showInnerpageSidebar: { type: DataTypes.BOOLEAN, defaultValue: true },
  showChatbot: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'home_settings',
  timestamps: true,
});




export default HomeSetting;