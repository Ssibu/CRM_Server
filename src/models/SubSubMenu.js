
// import { DataTypes } from 'sequelize';

// export default (sequelize) => {
//   sequelize.define('SubSubMenu', {
//     id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//     title_en: { type: DataTypes.STRING(500), allowNull: false },
//     title_od: { type: DataTypes.STRING(500), allowNull: false },
//     description_en: { type: DataTypes.TEXT, allowNull: true },
//     description_od: { type: DataTypes.TEXT, allowNull: true },
//     image_url: { type: DataTypes.STRING, allowNull: true },
//     link: { type: DataTypes.STRING, allowNull: true }, 
//     meta_title: { type: DataTypes.STRING, allowNull: true },
//     meta_keyword: { type: DataTypes.STRING, allowNull: true },
//     meta_description: { type: DataTypes.TEXT, allowNull: true },
//     status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' },
//     display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
//     subMenuId: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: { model: 'sub_menus', key: 'id' }
//     }
//   }, {
//     tableName: 'sub_sub_menus', 
//     timestamps: true
//   });
// };


import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const SubSubMenu = sequelize.define('SubSubMenu', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title_en: { type: DataTypes.STRING(500), allowNull: false, unique:true },
  title_od: { type: DataTypes.STRING(500), allowNull: false, unique:true },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  description_en: { type: DataTypes.TEXT, allowNull: true },
  description_od: { type: DataTypes.TEXT, allowNull: true },
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
