import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Users table
    await queryRunner.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'instructor', 'admin')),
        status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'suspended')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Courses table
    await queryRunner.query(`
      CREATE TABLE courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        instructor_id INTEGER REFERENCES users(id),
        category VARCHAR(100) NOT NULL,
        level VARCHAR(50) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
        duration INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Modules table
    await queryRunner.query(`
      CREATE TABLE modules (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Lessons table
    await queryRunner.query(`
      CREATE TABLE lessons (
        id SERIAL PRIMARY KEY,
        module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        video_url VARCHAR(255),
        duration INTEGER NOT NULL,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Enrollments table
    await queryRunner.query(`
      CREATE TABLE enrollments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        course_id INTEGER REFERENCES courses(id),
        status VARCHAR(20) NOT NULL CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
        enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(user_id, course_id)
      );
    `);

    // Create Progress table
    await queryRunner.query(`
      CREATE TABLE progress (
        id SERIAL PRIMARY KEY,
        enrollment_id INTEGER REFERENCES enrollments(id) ON DELETE CASCADE,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
        time_spent INTEGER NOT NULL DEFAULT 0,
        last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(enrollment_id, lesson_id)
      );
    `);

    // Create Assessments table
    await queryRunner.query(`
      CREATE TABLE assessments (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        passing_score INTEGER NOT NULL,
        time_limit INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Questions table
    await queryRunner.query(`
      CREATE TABLE questions (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER REFERENCES assessments(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
        options JSONB,
        correct_answer TEXT NOT NULL,
        points INTEGER NOT NULL,
        order_index INTEGER NOT NULL
      );
    `);

    // Create Attempts table
    await queryRunner.query(`
      CREATE TABLE attempts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        assessment_id INTEGER REFERENCES assessments(id),
        score INTEGER NOT NULL,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) NOT NULL CHECK (status IN ('in_progress', 'completed', 'abandoned'))
      );
    `);

    // Create Certificates table
    await queryRunner.query(`
      CREATE TABLE certificates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        course_id INTEGER REFERENCES courses(id),
        issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expiry_date TIMESTAMP WITH TIME ZONE,
        certificate_url VARCHAR(255) NOT NULL,
        UNIQUE(user_id, course_id)
      );
    `);

    // Create Feedback table
    await queryRunner.query(`
      CREATE TABLE feedback (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        course_id INTEGER REFERENCES courses(id),
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, course_id)
      );
    `);

    // Create Notifications table
    await queryRunner.query(`
      CREATE TABLE notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Notification Preferences table
    await queryRunner.query(`
      CREATE TABLE notification_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) UNIQUE,
        email BOOLEAN DEFAULT TRUE,
        push BOOLEAN DEFAULT TRUE,
        frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('instant', 'daily', 'weekly')),
        categories JSONB NOT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS notification_preferences');
    await queryRunner.query('DROP TABLE IF EXISTS notifications');
    await queryRunner.query('DROP TABLE IF EXISTS feedback');
    await queryRunner.query('DROP TABLE IF EXISTS certificates');
    await queryRunner.query('DROP TABLE IF EXISTS attempts');
    await queryRunner.query('DROP TABLE IF EXISTS questions');
    await queryRunner.query('DROP TABLE IF EXISTS assessments');
    await queryRunner.query('DROP TABLE IF EXISTS progress');
    await queryRunner.query('DROP TABLE IF EXISTS enrollments');
    await queryRunner.query('DROP TABLE IF EXISTS lessons');
    await queryRunner.query('DROP TABLE IF EXISTS modules');
    await queryRunner.query('DROP TABLE IF EXISTS courses');
    await queryRunner.query('DROP TABLE IF EXISTS users');
  }
} 