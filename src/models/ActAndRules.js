import { DataTypes } from 'sequelize';
// Make sure this path points to your central sequelize instance
import sequelize from '../../config/db.js';

const ActAndRule = sequelize.define(
  'ActAndRule',
  {
    titleEnglish: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    titleOdia: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descriptionEnglish: {
      type: DataTypes.TEXT, // TEXT is best for storing HTML content from a rich text editor
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
    tableName: 'act_and_rules', // Explicitly set the table name
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

export default ActAndRule;