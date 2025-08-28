// import sequelize from '../../config/db.js';

// import User from './User.js';
// import Page from './Page.js';
// import UserPagePermission from './PagePermission.js';
// import NewsAndEvent from "./NewsAndEvent.js"
// import ActAndRule from "./ActAndRules.js"
// import Footerlink from "./FooterLink.js"
// import Tender from "./Tender.js"
// import Corrigendum from "./Corrigendum.js"
// import Policy from './Policy.js';
// import Scheme from './Scheme.js';
// import HomepageBanner from './HomepageBanner.js';

// import ChatbotCategory from './ChatbotCategory.js';
// import ChatbotQuestion from './ChatbotQuestion.js';
// import ChatbotAnswer from './ChatbotAnswer.js';


// import defineMenuModel from './menu.model.js';
// import defineSubMenuModel from './submenu.model.js'; 
// import defineSubSubMenuModel from './subsubmenu.model.js'; 


// defineMenuModel(sequelize);
// defineSubMenuModel(sequelize); 
// defineSubSubMenuModel(sequelize); 

// const setupAssociations = () => {
//   try {
//     ChatbotCategory.hasMany(ChatbotQuestion, {
//       foreignKey: 'category_id',
//       as: 'questions'
//     });
    
//     ChatbotQuestion.belongsTo(ChatbotCategory, {
//       foreignKey: 'category_id',
//       as: 'category'
//     });
    
//     ChatbotQuestion.hasOne(ChatbotAnswer, {
//       foreignKey: 'question_id',
//       as: 'answer'
//     });
    
//     ChatbotAnswer.belongsTo(ChatbotQuestion, {
//       foreignKey: 'question_id',
//       as: 'question'
//     });
    
//     ChatbotCategory.hasMany(ChatbotAnswer, {
//       foreignKey: 'category_id',
//       as: 'answers'
//     });
    
//     ChatbotAnswer.belongsTo(ChatbotCategory, {
//       foreignKey: 'category_id',
//       as: 'category'
//     });
    
//     console.log('✅ All associations defined successfully');
//   } catch (error) {
//     console.error('❌ Error defining associations:', error);
//   }
// };

// // ✅ Associations setup करें
// setupAssociations();

// const models = {
//   sequelize,
//   User,
//   Page,
//   UserPagePermission,
//   NewsAndEvent,
//   Footerlink,
// ActAndRule,
// Tender,
// Corrigendum,
// Policy,
// Scheme,
// HomepageBanner
// };


// const { Menu, SubMenu, SubSubMenu } = sequelize.models;

// // --- Associations Section ---

// // Ek Menu ke paas bahut saare SubMenus ho sakte hain
// Menu.hasMany(SubMenu, { 
//     foreignKey: 'menuId',
//     as: 'SubMenus' // (Optional but good practice)
// }); 

// // Ek SubMenu ek hi Menu se juda hai
// SubMenu.belongsTo(Menu, { 
//     foreignKey: 'menuId',
//     // ❗️ YAHAN HAI ASLI FIX: 'as' property ko jodein
//     // Iska naam controller ke 'include' se bilkul match hona chahiye
//     as: 'Menu' 
// });
// SubMenu.hasMany(SubSubMenu, { foreignKey: 'subMenuId', as: 'SubSubMenus' });
// SubSubMenu.belongsTo(SubMenu, { foreignKey: 'subMenuId', as: 'SubMenu' });
// console.log('Menu and SubMenu associations defined successfully.');


// export default models;
// export {  sequelize, ChatbotCategory,
//   ChatbotQuestion,
//   ChatbotAnswer,
//   setupAssociations}


// src/models/index.js
import sequelize from '../../config/db.js';

// Core models
import User from './User.js';
import Page from './Page.js';
import UserPagePermission from './PagePermission.js';
import NewsAndEvent from './NewsAndEvent.js';
import ActAndRule from './ActAndRules.js';
import Footerlink from './FooterLink.js';
import Tender from './Tender.js';
import Corrigendum from './Corrigendum.js';
import Policy from './Policy.js';
import Scheme from './Scheme.js';
import HomepageBanner from './HomepageBanner.js';

// Chatbot models
import ChatbotCategory from './ChatbotCategory.js';
import ChatbotQuestion from './ChatbotQuestion.js';
import ChatbotAnswer from './ChatbotAnswer.js';

// Menu models
import Menu from './Menu.js';
import SubMenu from './SubMenu.js';
import SubSubMenu from './SubSubMenu.js';
import Form from './Form.js';

const models = {
  sequelize,

  // Core
  User,
  Page,
  UserPagePermission,
  NewsAndEvent,
  ActAndRule,
  Footerlink,
  Tender,
  Corrigendum,
  Policy,
  Scheme,
  HomepageBanner,

  // Chatbot
  ChatbotCategory,
  ChatbotQuestion,
  ChatbotAnswer,

  // Menu
  Menu,
  SubMenu,
  SubSubMenu,
  Form
};

Object.values(models).forEach((model) => {
  if (model && typeof model.associate === 'function') {
    model.associate(models);
  }
});

export default models;
