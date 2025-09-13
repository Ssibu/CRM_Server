

import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const SubSubMenu = sequelize.define('SubSubMenu', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  en_title: { type: DataTypes.STRING(35), allowNull: false, unique:true },
  od_title: { type: DataTypes.STRING(35), allowNull: false, unique:true },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  en_description: { type: DataTypes.TEXT, allowNull: true },
  od_description: { type: DataTypes.TEXT, allowNull: true },
  image_url: { type: DataTypes.STRING, allowNull: true },
  link: { type: DataTypes.STRING, allowNull: true },
  meta_title: { type: DataTypes.STRING, allowNull: true },
  meta_keyword: { type: DataTypes.STRING, allowNull: true },
  meta_description: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' },
  display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  subMenuId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'sub_menus', key: 'id' }
  }
}, {
  tableName: 'sub_sub_menus',
  timestamps: true
});

SubSubMenu.associate = (models) => {
  SubSubMenu.belongsTo(models.SubMenu, { foreignKey: 'subMenuId', as: 'SubMenu' });
};

export default SubSubMenu;
