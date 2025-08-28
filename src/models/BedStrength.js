import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const BedStrength = sequelize.define('BedStrength', {
    // 'id' is created automatically by Sequelize
    en_title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    od_title: {
        // Your schema says TEXT, but for a title, STRING is usually more appropriate
        // If your Odia titles can be very long, you can change this back to DataTypes.TEXT
        type: DataTypes.STRING, 
        allowNull: false,
    },
    document: {
        type: DataTypes.STRING, // Storing the file path from the uploader
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
    display_order: { // Using snake_case to match the database column directly
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
}, {
    tableName: 'bed_strengths', // Using plural and snake_case for the table name
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default BedStrength;