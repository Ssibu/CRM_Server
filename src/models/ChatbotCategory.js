// import { DataTypes } from 'sequelize';
// import sequelize  from '../../config/db.js';

// const ChatbotCategory = sequelize.define('ChatbotCategory', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   en: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     validate: {
//       notEmpty: true
//     }
//   },
//   od: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     validate: {
//       notEmpty: true
//     }
//   },
//   status: {
//     type: DataTypes.ENUM('Active', 'Inactive'),
//     defaultValue: 'Active'
//   },
//   image: {
//     type: DataTypes.STRING,
//     defaultValue: ''
//   },
//   order: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0
//   }
// }, {
//   tableName: 'chatbot_categories',
//   timestamps: true,
//   indexes: [
//     {
//       fields: ['en', 'od']
//     }
//   ]
// });

// export default ChatbotCategory;

import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const ChatbotCategory = sequelize.define('ChatbotCategory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  en: { type: DataTypes.STRING, allowNull: false },
  od: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' },
  image: { type: DataTypes.STRING, defaultValue: '' },
  order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'chatbot_categories',
  timestamps: true,
});

ChatbotCategory.associate = (models) => {
  ChatbotCategory.hasMany(models.ChatbotQuestion, { foreignKey: 'category_id', as: 'questions' });
  ChatbotCategory.hasMany(models.ChatbotAnswer, { foreignKey: 'category_id', as: 'answers' });
};

export default ChatbotCategory;
