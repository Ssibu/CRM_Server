import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js'; // Ensure this path is correct

const NewsAndEvent = sequelize.define(
  'NewsAndEvent',
  {
    titleEnglish: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    titleOdia: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    eventDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    descriptionEnglish: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    descriptionOdia: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    document: { // Renamed from 'image' to 'document' for clarity
      type: DataTypes.STRING,
      allowNull: false, // Assuming a document is required
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
    tableName: 'news_and_events',
    timestamps: true,
  }
);

export default NewsAndEvent;