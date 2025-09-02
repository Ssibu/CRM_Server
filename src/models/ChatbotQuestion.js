// import { DataTypes } from 'sequelize';
// import sequelize from '../../config/db.js';

// const ChatbotQuestion = sequelize.define('ChatbotQuestion', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   category_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     field: 'category_id'
//   },
//   en: {
//     type: DataTypes.TEXT,
//     allowNull: false,
//     validate: {
//       notEmpty: true
//     }
//   },
//   od: {
//     type: DataTypes.TEXT,
//     allowNull: false,
//     validate: {
//       notEmpty: true
//     }
//   },
//   status: {
//     type: DataTypes.ENUM('Active', 'Inactive'),
//     defaultValue: 'Active'
//   },
//   order: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0
//   }
// }, {
//   tableName: 'chatbot_questions',
//   timestamps: true,
//   indexes: [
//     {
//       fields: ['category_id']
//     }
//     // REMOVED the problematic index on text columns
//   ]
// });

// export default ChatbotQuestion;

import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const ChatbotQuestion = sequelize.define('ChatbotQuestion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  category_id: { type: DataTypes.INTEGER, allowNull: false },
  en: { type: DataTypes.TEXT, allowNull: false },
  od: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' },
  order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'chatbot_questions',
  timestamps: true,
});

ChatbotQuestion.associate = (models) => {
  ChatbotQuestion.belongsTo(models.ChatbotCategory, { foreignKey: 'category_id', as: 'category' });
  ChatbotQuestion.hasOne(models.ChatbotAnswer, { foreignKey: 'question_id', as: 'answer' });
};

export default ChatbotQuestion;
