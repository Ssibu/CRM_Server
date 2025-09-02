import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const BedStrength = sequelize.define('BedStrength', {
    en_title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Prevent duplicate English titles
        field: 'en_title'
    },
    od_title: {
        type: DataTypes.STRING, 
        allowNull: false,
        unique: true, // Prevent duplicate Odia titles
        field: 'od_title'
    },
    document: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Prevent duplicate document paths
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
    display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'display_order'
    }
}, {
    tableName: 'bed_strengths',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default BedStrength;