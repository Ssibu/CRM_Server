import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const NewsAndEvent = sequelize.define(
  'NewsAndEvent',
  {
    titleEnglish: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // <-- ADDED: Prevents duplicate English titles
    },
    titleOdia: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // <-- ADDED: Prevents duplicate Odia titles
    },
    eventDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    document: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // <-- ADDED: Ensures every file path is unique in the DB
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