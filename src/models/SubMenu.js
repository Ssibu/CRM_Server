// // src/models/submenu.model.js

// import { DataTypes } from 'sequelize';

// export default (sequelize) => {
//   sequelize.define('SubMenu', {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     title_en: {
//       type: DataTypes.STRING(500),
//       allowNull: false
//     },
//     title_od: {
//       type: DataTypes.STRING(500),
//       allowNull: false
//     },
//     description_en: {
//       type: DataTypes.TEXT,
//       allowNull: true
//     },
//     description_od: {
//       type: DataTypes.TEXT,
//       allowNull: true
//     },
//     image_url: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     link: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     status: {
//       type: DataTypes.ENUM('Active', 'Inactive'),
//       defaultValue: 'Active'
//     },
//     display_order: {
//       type: DataTypes.INTEGER,
//       defaultValue: 0
//     },

//     menuId: {
//         type: DataTypes.INTEGER,
//         allowNull: false, 
//         references: {
//             model: 'menus', 
//             key: 'id'      
//         }
//     }
  
//   }, {
//     tableName: 'sub_menus', 
//     timestamps: true
//   });
// };


import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const SubMenu = sequelize.define('SubMenu', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title_en: { type: DataTypes.STRING(500), allowNull: false, unique:true },
  title_od: { type: DataTypes.STRING(500), allowNull: false, unique:true },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  description_en: { type: DataTypes.TEXT, allowNull: true },
  description_od: { type: DataTypes.TEXT, allowNull: true },
  image_url: { type: DataTypes.STRING, allowNull: true },
  link: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' },
  display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  menuId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'menus', key: 'id' }
  }
}, {
  tableName: 'sub_menus',
  timestamps: true
});

SubMenu.associate = (models) => {
  SubMenu.belongsTo(models.Menu, { foreignKey: 'menuId', as: 'Menu' });
  SubMenu.hasMany(models.SubSubMenu, { foreignKey: 'subMenuId', as: 'SubSubMenus' });
};

export default SubMenu;
