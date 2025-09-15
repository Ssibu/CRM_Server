
// import { DataTypes } from 'sequelize';
// import sequelize from '../../config/db.js';

// const ChatbotCategory = sequelize.define('ChatbotCategory', {
//   id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//   en_title: { type: DataTypes.STRING, allowNull: false },
//   od_title: { type: DataTypes.STRING, allowNull: false },
//   status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' },
//   image: { type: DataTypes.STRING, defaultValue: '' },
//   order: { type: DataTypes.INTEGER, defaultValue: 0 }
// }, {
//   tableName: 'chatbot_categories',
//   timestamps: true,
// });

// ChatbotCategory.associate = (models) => {
//   ChatbotCategory.hasMany(models.ChatbotQuestion, { foreignKey: 'category_id', as: 'questions' });
//   ChatbotCategory.hasMany(models.ChatbotAnswer, { foreignKey: 'category_id', as: 'answers' });
// };

// export default ChatbotCategory;

import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const ChatbotCategory = sequelize.define('ChatbotCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  en_title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'A category with this English name already exists.' // Mensaje de error personalizado para la restricción única
    },
    validate: {
      notNull: {
        msg: 'English name cannot be null.'
      },
      notEmpty: {
        msg: 'English name cannot be empty.'
      },
      len: {
        args: [1, 100],
        msg: 'English name must be between 1 and 100 characters long.'
      }
    }
  },

  od_title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      msg: 'A category with this Odia name already exists.' // Mensaje de error personalizado para la restricción única
    },
    validate: {
      notNull: {
        msg: 'Odia name cannot be null.'
      },
      notEmpty: {
        msg: 'Odia name cannot be empty.'
      },
      len: {
        args: [1, 100],
        msg: 'Odia name must be between 1 and 100 characters long.'
      }
    }
  },

  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active'
  },

  image: {
    type: DataTypes.STRING,
    defaultValue: ''
  },

  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }

}, {
  tableName: 'chatbot_categories',
  timestamps: true,
});

// Asociaciones
ChatbotCategory.associate = (models) => {
  ChatbotCategory.hasMany(models.ChatbotQuestion, {
    foreignKey: 'category_id',
    as: 'questions'
  });

  ChatbotCategory.hasMany(models.ChatbotAnswer, {
    foreignKey: 'category_id',
    as: 'answers'
  });
};

export default ChatbotCategory;