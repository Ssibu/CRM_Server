import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const GeneratedLink = sequelize.define("GeneratedLink", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  filePath: { type: DataTypes.STRING, allowNull: false } 
});

export default GeneratedLink;