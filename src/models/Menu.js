
import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Menu = sequelize.define('Menu', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title_en: { type: DataTypes.STRING, allowNull: false, unique:true },
  title_od: { type: DataTypes.STRING, allowNull: false, unique:true },
   slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  description_en: { type: DataTypes.TEXT, allowNull: true },
  description_od: { type: DataTypes.TEXT, allowNull: true },
  image_url: { type: DataTypes.STRING, allowNull: false },
  link: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' },
  display_order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  tableName: 'menus',
  timestamps: true
});

Menu.associate = (models) => {
  Menu.hasMany(models.SubMenu, { foreignKey: 'menuId', as: 'SubMenus' });
};

export default Menu;

