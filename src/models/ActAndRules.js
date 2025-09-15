import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const ActAndRule = sequelize.define(
  'ActAndRule',
  {
    en_title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true 
    },
    od_title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true 
    },
     date: {
      type: DataTypes.DATEONLY, 
      allowNull: false,        
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