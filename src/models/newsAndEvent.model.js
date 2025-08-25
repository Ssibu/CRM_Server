import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

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
    // descriptionEnglish and descriptionOdia have been removed
    document: {
      type: DataTypes.STRING,
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
    tableName: 'news_and_events',
    timestamps: true,
  }
);

export default NewsAndEvent;