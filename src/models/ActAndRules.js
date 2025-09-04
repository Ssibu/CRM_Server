import { DataTypes } from 'sequelize';
// Make sure this path points to your central sequelize instance
import sequelize from '../../config/db.js';

const ActAndRule = sequelize.define(
  'ActAndRule',
  {
    titleEnglish: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true 
    },
    titleOdia: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true 
    },
    descriptionEnglish: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    descriptionOdia: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Active',
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'act_and_rules',
    timestamps: true,
  }
);

export default ActAndRule;