

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
import Notice from "./Notice.js"
import Advertisement from "./Advertisement.js"
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

import HomeSetting from './HomeSetting.js';

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
  Notice,
  Advertisement,
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

  HomeSetting
};

Object.values(models).forEach((model) => {
  if (model && typeof model.associate === 'function') {
    model.associate(models);
  }
});

export default models;
