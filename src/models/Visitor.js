import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js"; // adjust path if needed

const Visitor = sequelize.define(
  "Visitor",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    visitedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    visitCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // start with 1 for first visit
    },
  },
  {
    tableName: "visitors",
    timestamps: false,
  }
);

export default Visitor;
