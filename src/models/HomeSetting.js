import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js'; // Adjust path to your db config

const HomeSetting = sequelize.define('HomeSetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  orgName_en: { type: DataTypes.TEXT, allowNull: true },
  orgName_od: { type: DataTypes.TEXT, allowNull: true },
  personDesignation_en: { type: DataTypes.TEXT, allowNull: true },
  personDesignation_od: { type: DataTypes.TEXT, allowNull: true },
  personName_en: { type: DataTypes.TEXT, allowNull: true },
  personName_od: { type: DataTypes.TEXT, allowNull: true },
  overviewDescription_en: { type: DataTypes.TEXT, allowNull: true },
  overviewDescription_od: { type: DataTypes.TEXT, allowNull: true },
  address_en: { type: DataTypes.TEXT, allowNull: true },
  address_od: { type: DataTypes.TEXT, allowNull: true },
  email: { type: DataTypes.STRING, allowNull: true },
  mobileNumber: { type: DataTypes.STRING, allowNull: true },
  facebookLink: { type: DataTypes.STRING, allowNull: true },
  twitterLink: { type: DataTypes.STRING, allowNull: true },
  instagramLink: { type: DataTypes.STRING, allowNull: true },
  linkedinLink: { type: DataTypes.STRING, allowNull: true },
  odishaLogo: { type: DataTypes.STRING, allowNull: true }, // Filename only
  cmPhoto: { type: DataTypes.STRING, allowNull: true },    // Filename only
  showInnerpageSidebar: { type: DataTypes.BOOLEAN, defaultValue: true },
  showChatbot: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'home_settings',
  timestamps: true,
});




export default HomeSetting;