import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const Log = sequelize.define("Log", {
  user_id: {
    type: DataTypes.INTEGER, 
    allowNull: false,
  },
  action: {
    type: DataTypes.ENUM("CREATE", "READ", "UPDATE", "DELETE", "LOGIN", "LOGOUT"),
    allowNull: false,
  },
  page_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  target_id: {
    type: DataTypes.INTEGER,
    allowNull: true, 
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  browser:{
    type: DataTypes.STRING,
    allowNull : true
  },
    os:{
    type: DataTypes.STRING,
    allowNull : true
  },
    platform:{
    type: DataTypes.STRING,
    allowNull : true
  },
  user_agent: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
    tableName:"log_records",
  timestamps: true,
  underscored: true
});

export default Log;
