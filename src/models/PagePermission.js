import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import User from "./User.js";
import Page from "./Page.js";

const UserPagePermission = sequelize.define(
  "UserPagePermission",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
      allowNull: false,
    },
    pageId: {
      type: DataTypes.INTEGER,
      references: {
        model: Page,
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    tableName: "user_page_permissions",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'page_id'],
      },
    ],
    underscored: true,
  }
);

User.belongsToMany(Page, { through: UserPagePermission, foreignKey: 'userId', as: 'pages' });
Page.belongsToMany(User, { through: UserPagePermission, foreignKey: 'pageId', as: 'users' });

export default UserPagePermission;