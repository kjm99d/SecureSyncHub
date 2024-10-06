// UserPolicy.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserPolicy = sequelize.define('UserPolicy', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    policyId: {
      type: DataTypes.UUID,
      references: {
        model: 'Policies',
        key: 'id',
      },
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id',
      },
      allowNull: false,
    },
    policyValue: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    timestamps: true,
  });

export default UserPolicy;
