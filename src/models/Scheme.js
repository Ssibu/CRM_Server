import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Scheme = sequelize.define('Scheme', {
    // 'id' is created automatically by Sequelize
    en_title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    od_title: {
        type: DataTypes.STRING, // Using STRING is fine for titles
        allowNull: false,
    },
    document: {
        type: DataTypes.STRING, // Storing the file path as a string
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // Corresponds to tinyint(1) default 1
    },
    is_delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Corresponds to tinyint(1) default 0 for soft deletes
    },
    // Adding displayOrder for sorting functionality
    displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
    // 'created_at' and 'updated_at' are handled by Sequelize automatically
}, {
    tableName: 'schemes',
    timestamps: true,
    // These options ensure Sequelize maps camelCase in JS to snake_case in the DB
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default Scheme;