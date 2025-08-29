import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Scheme = sequelize.define('Scheme', {
    en_title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'en_title' // DB column is snake_case
    },
    od_title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'od_title' // DB column is snake_case
    },
    document: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'document' // DB column is snake_case
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active' // DB column is snake_case
    },
    is_delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_delete' // DB column is snake_case
    },
    // --- THIS IS THE CRITICAL FIX ---
    displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'displayOrder' // CORRECTED: Point to the camelCase column in the database
    }
}, {
    tableName: 'schemes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // REMOVED: `underscored: true` is removed because the table uses mixed naming conventions.
    // Explicit `field` mapping on each property is safer and clearer.
});

export default Scheme;