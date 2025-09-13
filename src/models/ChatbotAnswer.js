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


// import { DataTypes } from 'sequelize';
// import sequelize from '../../config/db.js';

// const ChatbotAnswer = sequelize.define('ChatbotAnswer', {
//   id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//   category_id: { type: DataTypes.INTEGER, allowNull: false },
//   question_id: { type: DataTypes.INTEGER, allowNull: false },
//   en_answer: { type: DataTypes.TEXT, allowNull: false },
//   od_answer: { type: DataTypes.TEXT, allowNull: false },
//   status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' }
// }, {
//   tableName: 'chatbot_answers',
//   timestamps: true
// });

// ChatbotAnswer.associate = (models) => {
//   ChatbotAnswer.belongsTo(models.ChatbotCategory, { foreignKey: 'category_id', as: 'category' });
//   ChatbotAnswer.belongsTo(models.ChatbotQuestion, { foreignKey: 'question_id', as: 'question' });
// };

// export default ChatbotAnswer;

import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const ChatbotAnswer = sequelize.define('ChatbotAnswer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'chatbot_categories', // Assumes table name is 'chatbot_categories'
      key: 'id'
    }
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: {
      msg: 'An answer for this question already exists.' // Each question can only have one answer
    },
    references: {
      model: 'chatbot_questions', // Assumes table name is 'chatbot_questions'
      key: 'id'
    }
  },
  en_answer: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: {
      msg: 'This English answer already exists.'
    },
    validate: {
      notNull: {
        msg: 'English answer cannot be null.'
      },
      notEmpty: {
        msg: 'English answer cannot be empty.'
      },
      len: {
        args: [2, 1000], // Minimum 2 and Maximum 1000 characters
        msg: 'English answer must be between 2 and 1000 characters long.'
      }
    }
  },
  od_answer: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: {
      msg: 'This Odia answer already exists.'
    },
    validate: {
      notNull: {
        msg: 'Odia answer cannot be null.'
      },
      notEmpty: {
        msg: 'Odia answer cannot be empty.'
      },
      len: {
        args: [2, 1000], // Minimum 2 and Maximum 1000 characters
        msg: 'Odia answer must be between 2 and 1000 characters long.'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active'
  }
}, {
  tableName: 'chatbot_answers',
  timestamps: true
});

// Associations
ChatbotAnswer.associate = (models) => {
  ChatbotAnswer.belongsTo(models.ChatbotCategory, { foreignKey: 'category_id', as: 'category' });
  ChatbotAnswer.belongsTo(models.ChatbotQuestion, { foreignKey: 'question_id', as: 'question' });
};

export default ChatbotAnswer;