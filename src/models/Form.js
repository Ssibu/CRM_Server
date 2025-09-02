import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Form = sequelize.define('Form', {
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
        type: DataTypes.STRING, // Stores the file path from the uploader
        allowNull: false,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // Corresponds to tinyint(1) default 1
    },
    is_delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // For soft deletes
    },
    displayOrder: { // <-- Property name in JavaScript is camelCase
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'display_order' // <-- Tell Sequelize the DB column name is snake_case
    }
    // 'created_at' and 'updated_at' are handled by Sequelize automatically
}, {
    tableName: 'forms',
    timestamps: true,
    // These options map snake_case in DB to camelCase in JS if needed,
    // but we will stick to snake_case in the model for consistency with your schema.
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default Form;