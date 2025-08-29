import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Form = sequelize.define('Form', {
    en_title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // <-- ADDED: Prevents duplicate English titles
        field: 'en_title'
    },
    od_title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // <-- ADDED: Prevents duplicate Odia titles
        field: 'od_title'
    },
    document: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // <-- ADDED: Prevents duplicate document paths
        field: 'document'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    },
    is_delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_delete'
    },
    displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        // Assuming your 'forms' table also uses display_order (snake_case)
        // If it uses displayOrder (camelCase), change this to 'displayOrder'
        field: 'display_order' 
    }
}, {
    tableName: 'forms',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true // Keep for consistency
});

export default Form;