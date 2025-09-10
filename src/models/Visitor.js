// src/models/Visitor.js
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js"; // adjust path if needed

const Visitor = sequelize.define("Visitor", {
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
}, {
  tableName: "visitors",
  timestamps: false,
});

export default Visitor;
