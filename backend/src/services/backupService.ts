import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { storageService } from './storageService';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Assessment } from '../models/Assessment';
import { Certificate } from '../models/Certificate';

const execAsync = promisify(exec);

class BackupService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../../backups', timestamp);
    const backupFile = path.join(backupDir, 'backup.sql');

    // Create backup directory
    await fs.promises.mkdir(backupDir, { recursive: true });

    // Create database backup
    await execAsync(
      `pg_dump -U ${process.env.DB_USER} -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} ${process.env.DB_NAME} > ${backupFile}`
    );

    // Create data backup
    const dataBackup = {
      users: await User.find(),
      courses: await Course.find(),
      assessments: await Assessment.find(),
      certificates: await Certificate.find(),
    };

    await fs.promises.writeFile(
      path.join(backupDir, 'data.json'),
      JSON.stringify(dataBackup, null, 2)
    );

    // Upload to S3
    const backupKey = `backups/${timestamp}.zip`;
    await this.uploadBackupToS3(backupDir, backupKey);

    // Clean up local files
    await fs.promises.rm(backupDir, { recursive: true });

    return backupKey;
  }

  private async uploadBackupToS3(
    backupDir: string,
    backupKey: string
  ): Promise<void> {
    const zipCommand = `cd ${backupDir} && zip -r backup.zip .`;
    await execAsync(zipCommand);

    const fileStream = fs.createReadStream(path.join(backupDir, 'backup.zip'));
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: backupKey,
      Body: fileStream,
    });

    await this.s3Client.send(command);
  }

  async restoreBackup(backupKey: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const restoreDir = path.join(__dirname, '../../restores', timestamp);

    // Create restore directory
    await fs.promises.mkdir(restoreDir, { recursive: true });

    // Download from S3
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: backupKey,
    });

    const response = await this.s3Client.send(command);
    const fileStream = response.Body as NodeJS.ReadableStream;
    const writeStream = fs.createWriteStream(path.join(restoreDir, 'backup.zip'));

    await new Promise((resolve, reject) => {
      fileStream.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Extract backup
    await execAsync(`unzip ${path.join(restoreDir, 'backup.zip')} -d ${restoreDir}`);

    // Restore database
    await execAsync(
      `psql -U ${process.env.DB_USER} -h ${process.env.DB_HOST} -p ${process.env.DB_PORT} ${process.env.DB_NAME} < ${path.join(restoreDir, 'backup.sql')}`
    );

    // Restore data
    const dataBackup = JSON.parse(
      await fs.promises.readFile(path.join(restoreDir, 'data.json'), 'utf-8')
    );

    await User.deleteMany({});
    await Course.deleteMany({});
    await Assessment.deleteMany({});
    await Certificate.deleteMany({});

    await User.insertMany(dataBackup.users);
    await Course.insertMany(dataBackup.courses);
    await Assessment.insertMany(dataBackup.assessments);
    await Certificate.insertMany(dataBackup.certificates);

    // Clean up
    await fs.promises.rm(restoreDir, { recursive: true });
  }

  async listBackups(): Promise<string[]> {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: 'backups/',
    });

    const response = await this.s3Client.send(command);
    return response.Contents?.map((obj) => obj.Key || '') || [];
  }

  async deleteBackup(backupKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: backupKey,
    });

    await this.s3Client.send(command);
  }
}

export const backupService = new BackupService(); 