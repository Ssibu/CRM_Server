// import { DataTypes } from 'sequelize';
// import  sequelize  from '../../config/db.js';

// const ChatbotAnswer = sequelize.define('ChatbotAnswer', {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   category_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'chatbot_categories',
//       key: 'id'
//     }
//   },
//   question_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: 'chatbot_questions',
//       key: 'id'
//     }
//   },
//   en: {
//     type: DataTypes.TEXT,
//     allowNull: false
//   },
//   od: {
//     type: DataTypes.TEXT,
//     allowNull: false
//   },
//   status: {
//     type: DataTypes.ENUM('Active', 'Inactive'),
//     defaultValue: 'Active'
//   }
// }, {
//   tableName: 'chatbot_answers',
//   timestamps: true
// });

// // ✅ Associations define karo
// export const associate = (models) => {
//   ChatbotAnswer.belongsTo(models.ChatbotCategory, {
//     foreignKey: 'category_id',
//     as: 'category'
//   });
  
//   ChatbotAnswer.belongsTo(models.ChatbotQuestion, {
//     foreignKey: 'question_id',
//     as: 'question'
//   });
// };

// export default ChatbotAnswer;


import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const ChatbotAnswer = sequelize.define('ChatbotAnswer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  category_id: { type: DataTypes.INTEGER, allowNull: false },
  question_id: { type: DataTypes.INTEGER, allowNull: false },
  en: { type: DataTypes.TEXT, allowNull: false },
  od: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' }
}, {
  tableName: 'chatbot_answers',
  timestamps: true
});

ChatbotAnswer.associate = (models) => {
  ChatbotAnswer.belongsTo(models.ChatbotCategory, { foreignKey: 'category_id', as: 'category' });
  ChatbotAnswer.belongsTo(models.ChatbotQuestion, { foreignKey: 'question_id', as: 'question' });
};

export default ChatbotAnswer;
