const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const cron = require('node-cron');
require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const BACKUP_DIR = path.join(__dirname, '../../backups');
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '30');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `db-backup-${timestamp}.sql`;
  const filepath = path.join(BACKUP_DIR, filename);

  return new Promise((resolve, reject) => {
    const command = `pg_dump -h ${process.env.DB_HOST} -U ${process.env.DB_USERNAME} -d ${process.env.DB_NAME} > ${filepath}`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Database backup failed: ${error.message}`);
        reject(error);
        return;
      }
      console.log(`Database backup created: ${filename}`);
      resolve(filepath);
    });
  });
}

async function uploadToS3(filepath) {
  const filename = path.basename(filepath);
  const fileContent = fs.readFileSync(filepath);

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `backups/${filename}`,
    Body: fileContent
  };

  try {
    await s3.upload(params).promise();
    console.log(`File uploaded successfully: ${filename}`);
    return true;
  } catch (error) {
    console.error(`Error uploading to S3: ${error.message}`);
    return false;
  }
}

async function cleanupOldBackups() {
  const files = fs.readdirSync(BACKUP_DIR);
  const now = new Date();

  for (const file of files) {
    const filepath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filepath);
    const ageInDays = (now - stats.mtime) / (1000 * 60 * 60 * 24);

    if (ageInDays > RETENTION_DAYS) {
      fs.unlinkSync(filepath);
      console.log(`Deleted old backup: ${file}`);
    }
  }
}

async function performBackup() {
  try {
    console.log('Starting backup process...');
    
    // Backup database
    const backupFile = await backupDatabase();
    
    // Upload to S3
    await uploadToS3(backupFile);
    
    // Cleanup old backups
    await cleanupOldBackups();
    
    console.log('Backup process completed successfully');
  } catch (error) {
    console.error('Backup process failed:', error);
  }
}

// Schedule backup
const schedule = process.env.BACKUP_SCHEDULE || '0 0 * * *'; // Daily at midnight
cron.schedule(schedule, performBackup);

// Export for manual execution
module.exports = {
  performBackup,
  backupDatabase,
  uploadToS3,
  cleanupOldBackups
}; 