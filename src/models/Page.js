import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const Page = sequelize.define(
  "Page",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    pageName: {
      type: DataTypes.STRING(150),
      allowNull: false,
	  unique: true, 
    },
    shortCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true, 
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
      isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "pages",
    timestamps: true, 
    underscored: true, 
  }
);

export default Page;
