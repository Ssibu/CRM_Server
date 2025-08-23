import sequelize from "../config/sequelize.js";
import User from "./User.js";
import Page from "./Page.js"

const models = {
  sequelize,
  User,
};

export { sequelize };
export default models;
