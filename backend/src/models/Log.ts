import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface LogAttributes {
  id: number;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
  details?: string;
  userId?: number;
}

class Log extends Model<LogAttributes> implements LogAttributes {
  public id!: number;
  public level!: 'info' | 'warning' | 'error';
  public message!: string;
  public source!: string;
  public details?: string;
  public userId?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Log.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    level: {
      type: DataTypes.ENUM('info', 'warning', 'error'),
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Log',
    tableName: 'logs',
    indexes: [
      {
        fields: ['level'],
      },
      {
        fields: ['createdAt'],
      },
      {
        fields: ['source'],
      },
    ],
  }
);

export default Log; 