import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface SystemSettingsAttributes {
  id: number;
  security: {
    requireEmailVerification: boolean;
    passwordMinLength: number;
    sessionTimeout: number;
    twoFactorAuth: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    notificationFrequency: 'immediate' | 'daily' | 'weekly';
  };
  performance: {
    cacheEnabled: boolean;
    cacheDuration: number;
    maxUploadSize: number;
  };
  storage: {
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    maxBackups: number;
    storageProvider: 'local' | 's3' | 'azure';
  };
}

class SystemSettings extends Model<SystemSettingsAttributes> implements SystemSettingsAttributes {
  public id!: number;
  public security!: {
    requireEmailVerification: boolean;
    passwordMinLength: number;
    sessionTimeout: number;
    twoFactorAuth: boolean;
  };
  public notifications!: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    notificationFrequency: 'immediate' | 'daily' | 'weekly';
  };
  public performance!: {
    cacheEnabled: boolean;
    cacheDuration: number;
    maxUploadSize: number;
  };
  public storage!: {
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    maxBackups: number;
    storageProvider: 'local' | 's3' | 'azure';
  };

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SystemSettings.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    security: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        requireEmailVerification: true,
        passwordMinLength: 8,
        sessionTimeout: 30,
        twoFactorAuth: false,
      },
    },
    notifications: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        emailNotifications: true,
        pushNotifications: true,
        notificationFrequency: 'immediate',
      },
    },
    performance: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        cacheEnabled: true,
        cacheDuration: 60,
        maxUploadSize: 10,
      },
    },
    storage: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        backupFrequency: 'daily',
        maxBackups: 7,
        storageProvider: 'local',
      },
    },
  },
  {
    sequelize,
    modelName: 'SystemSettings',
    tableName: 'system_settings',
  }
);

export default SystemSettings; 