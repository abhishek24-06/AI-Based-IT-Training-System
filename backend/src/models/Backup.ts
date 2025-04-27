import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface BackupAttributes {
  id: number;
  filename: string;
  filePath: string;
  size: number;
  status: 'pending' | 'completed' | 'failed' | 'restored';
  createdBy: number;
  restoredAt?: Date;
  restoredBy?: number;
}

class Backup extends Model<BackupAttributes> implements BackupAttributes {
  public id!: number;
  public filename!: string;
  public filePath!: string;
  public size!: number;
  public status!: 'pending' | 'completed' | 'failed' | 'restored';
  public createdBy!: number;
  public restoredAt?: Date;
  public restoredBy?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Backup.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    size: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'restored'),
      allowNull: false,
      defaultValue: 'pending',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    restoredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    restoredBy: {
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
    modelName: 'Backup',
    tableName: 'backups',
    indexes: [
      {
        fields: ['status'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

export default Backup; 