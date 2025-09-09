
import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const ChatbotCategory = sequelize.define('ChatbotCategory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  en_title: { type: DataTypes.STRING, allowNull: false },
  od_title: { type: DataTypes.STRING, allowNull: false },
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
