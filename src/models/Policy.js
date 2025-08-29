import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Policy = sequelize.define('Policy', {
    en_title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // <-- ADDED: Prevents duplicate English titles
        field: 'en_title' // Explicitly map to the snake_case column
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
        field: 'display_order' // Map to display_order column
    }
}, {
    tableName: 'policies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // The underscored option is still good to have as a fallback,
    // but explicit 'field' mapping is safer.
    underscored: true, 
});

export default Policy;