import sequelize from "../config/sequelize.js";
import User from "./User.js";
import Page from "./Page.js";
import ActAndRule from "./actAndRule.model.js";
import Footerlink from "./footerlink.model.js";
import NewsAndEvent from "./newsAndEvent.model.js";

const models = {
  sequelize,
  User,
  ActAndRule,
  Footerlink,
  NewsAndEvent

};

export { sequelize };
export default models;
