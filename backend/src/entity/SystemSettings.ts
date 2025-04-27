import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class SystemSettings {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("json")
  security!: {
    enableEmailVerification: boolean;
    passwordMinLength: number;
    sessionTimeout: number;
    twoFactorAuth: boolean;
  };

  @Column("json")
  notifications!: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    notificationFrequency: string;
  };

  @Column("json")
  performance!: {
    cacheEnabled: boolean;
    cacheDuration: number;
    maxUploadSize: number;
  };

  @Column("json")
  storage!: {
    backupFrequency: string;
    maxBackups: number;
    storageProvider: string;
  };

  @Column()
  siteName!: string;

  @Column("text")
  siteDescription!: string;

  @Column()
  contactEmail!: string;

  @Column()
  supportEmail!: string;

  @Column()
  maxFileSize!: number;

  @Column("simple-array")
  allowedFileTypes!: string[];

  @Column()
  maintenanceMode!: boolean;

  @Column("text")
  maintenanceMessage!: string;

  @Column()
  enableRegistration!: boolean;

  @Column()
  enablePasswordReset!: boolean;

  @Column()
  maxLoginAttempts!: number;

  @Column()
  passwordExpiryDays!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 