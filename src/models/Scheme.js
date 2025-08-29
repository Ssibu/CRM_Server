import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Scheme = sequelize.define('Scheme', {
    en_title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // <-- ADDED: Prevents duplicate English titles
        field: 'en_title' // Explicit mapping
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
        field: 'display_order' // Map to snake_case
    }
}, {
    tableName: 'schemes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true // Keep this for consistency
});

export default Scheme;