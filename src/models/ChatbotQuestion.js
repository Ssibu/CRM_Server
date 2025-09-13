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

// import { DataTypes } from 'sequelize';
// import sequelize from '../../config/db.js';

// const ChatbotQuestion = sequelize.define('ChatbotQuestion', {
//   id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//   category_id: { type: DataTypes.INTEGER, allowNull: false },
//   en_question: { type: DataTypes.TEXT, allowNull: false },
//   od_question: { type: DataTypes.TEXT, allowNull: false },
//   status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' },
//   order: { type: DataTypes.INTEGER, defaultValue: 0 }
// }, {
//   tableName: 'chatbot_questions',
//   timestamps: true,
// });

// ChatbotQuestion.associate = (models) => {
//   ChatbotQuestion.belongsTo(models.ChatbotCategory, { foreignKey: 'category_id', as: 'category' });
//   ChatbotQuestion.hasOne(models.ChatbotAnswer, { foreignKey: 'question_id', as: 'answer' });
// };

// export default ChatbotQuestion;



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
//     allowNull: false
//   },

//   en_question: {
//     type: DataTypes.STRING(255),
//     allowNull: false,
//     validate: {
//       len: {
//         args: [1, 255],
//         msg: 'English question must be 1 to 255 characters long'
//       }
//     }
//   },

//   od_question: {
//     type: DataTypes.STRING(255),
//     allowNull: false,
//     validate: {
//       len: {
//         args: [1, 255],
//         msg: 'Odia question must be 1 to 255 characters long'
//       }
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
//     // Composite unique index for English question per category
//     {
//       unique: true,
//       fields: ['category_id', 'en_question'],
//       name: 'unique_en_question_per_category'
//     },
//     // Composite unique index for Odia question per category
//     {
//       unique: true,
//       fields: ['category_id', 'od_question'],
//       name: 'unique_od_question_per_category'
//     }
//   ]
// });

// // Associations
// ChatbotQuestion.associate = (models) => {
//   ChatbotQuestion.belongsTo(models.ChatbotCategory, {
//     foreignKey: 'category_id',
//     as: 'category'
//   });

//   ChatbotQuestion.hasOne(models.ChatbotAnswer, {
//     foreignKey: 'question_id',
//     as: 'answer'
//   });
// };

// export default ChatbotQuestion;





import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const ChatbotQuestion = sequelize.define('ChatbotQuestion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  en_question: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      name: 'unique_en_question',
      msg: 'English question must be unique across all categories'
    },
    validate: {
      len: {
        args: [1, 255],
        msg: 'English question must be 1 to 255 characters long'
      }
    }
  },

  od_question: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      name: 'unique_od_question',
      msg: 'Odia question must be unique across all categories'
    },
    validate: {
      len: {
        args: [1, 255],
        msg: 'Odia question must be 1 to 255 characters long'
      }
    }
  },

  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active'
  },

  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }

}, {
  tableName: 'chatbot_questions',
  timestamps: true
});

// Associations
ChatbotQuestion.associate = (models) => {
  ChatbotQuestion.belongsTo(models.ChatbotCategory, {
    foreignKey: 'category_id',
    as: 'category'
  });

  ChatbotQuestion.hasOne(models.ChatbotAnswer, {
    foreignKey: 'question_id',
    as: 'answer'
  });
};

export default ChatbotQuestion;