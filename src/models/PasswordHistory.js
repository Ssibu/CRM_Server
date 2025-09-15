import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const PasswordHistory = sequelize.define(
  'PasswordHistory',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // This should match the table name of your User model
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'password_histories',
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

PasswordHistory.associate = (models) => {
  // This line defines the relationship, stating that a PasswordHistory entry
  // belongs to one User.
  PasswordHistory.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
  });
};

export default PasswordHistory;