import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Policy = sequelize.define('Policy', {
    // id is created automatically by Sequelize
    en_title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    od_title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    document: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // Corresponds to tinyint(1) default 1
    },
    is_delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Corresponds to tinyint(1) default 0
    },
    // created_at and updated_at are handled by `timestamps: true`
    displayOrder: { // Adding this for the sorting feature
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
}, {
    tableName: 'policies',
    timestamps: true,
    // Map snake_case database columns to camelCase model properties
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true, // This is important for Sequelize to handle snake_case
});

export default Policy;

