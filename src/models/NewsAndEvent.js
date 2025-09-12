import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const NewsAndEvent = sequelize.define(
  'NewsAndEvent',
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
    eventDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    document: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true 
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