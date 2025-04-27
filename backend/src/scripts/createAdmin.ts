import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import bcrypt from 'bcryptjs';
import { Role } from '../types/enums';

async function createAdmin() {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    console.log('Database connection initialized');

    // Check if admin user already exists
    const adminUser = await AppDataSource.getRepository(User).findOne({
      where: { email: 'admin@example.com' }
    });

    if (adminUser) {
      console.log('Admin user already exists:', adminUser);
      return;
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = AppDataSource.getRepository(User).create({
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true
    });

    await AppDataSource.getRepository(User).save(admin);
    console.log('Admin user created successfully');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close the database connection
    await AppDataSource.destroy();
  }
}

createAdmin(); 