import { DataTypes } from 'sequelize';
// Make sure this path points to your central sequelize instance
import sequelize from '../../config/db.js';

const ActAndRule = sequelize.define(
  'ActAndRule',
  {
    en_title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true 
    },
    od_title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true 
    },
     date: {
      type: DataTypes.DATEONLY, // Stores date in 'YYYY-MM-DD' format
      allowNull: false,         // Make it a required field
    },
    en_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    od_description: {
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