import { MigrationInterface, QueryRunner } from 'typeorm';

export class OptimizationIndexes1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table indexes
    await queryRunner.query(`
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_role ON users(role);
      CREATE INDEX idx_users_status ON users(status);
      CREATE INDEX idx_users_created_at ON users(created_at);
    `);

    // Courses table indexes
    await queryRunner.query(`
      CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
      CREATE INDEX idx_courses_category ON courses(category);
      CREATE INDEX idx_courses_level ON courses(level);
      CREATE INDEX idx_courses_status ON courses(status);
      CREATE INDEX idx_courses_created_at ON courses(created_at);
    `);

    // Modules table indexes
    await queryRunner.query(`
      CREATE INDEX idx_modules_course_id ON modules(course_id);
      CREATE INDEX idx_modules_order_index ON modules(order_index);
    `);

    // Lessons table indexes
    await queryRunner.query(`
      CREATE INDEX idx_lessons_module_id ON lessons(module_id);
      CREATE INDEX idx_lessons_order_index ON lessons(order_index);
    `);

    // Enrollments table indexes
    await queryRunner.query(`
      CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
      CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
      CREATE INDEX idx_enrollments_status ON enrollments(status);
      CREATE INDEX idx_enrollments_created_at ON enrollments(created_at);
    `);

    // Progress table indexes
    await queryRunner.query(`
      CREATE INDEX idx_progress_enrollment_id ON progress(enrollment_id);
      CREATE INDEX idx_progress_lesson_id ON progress(lesson_id);
      CREATE INDEX idx_progress_status ON progress(status);
    `);

    // Assessments table indexes
    await queryRunner.query(`
      CREATE INDEX idx_assessments_course_id ON assessments(course_id);
    `);

    // Questions table indexes
    await queryRunner.query(`
      CREATE INDEX idx_questions_assessment_id ON questions(assessment_id);
      CREATE INDEX idx_questions_order_index ON questions(order_index);
    `);

    // Attempts table indexes
    await queryRunner.query(`
      CREATE INDEX idx_attempts_user_id ON attempts(user_id);
      CREATE INDEX idx_attempts_assessment_id ON attempts(assessment_id);
      CREATE INDEX idx_attempts_created_at ON attempts(created_at);
    `);

    // Certificates table indexes
    await queryRunner.query(`
      CREATE INDEX idx_certificates_user_id ON certificates(user_id);
      CREATE INDEX idx_certificates_course_id ON certificates(course_id);
      CREATE INDEX idx_certificates_created_at ON certificates(created_at);
    `);

    // Feedback table indexes
    await queryRunner.query(`
      CREATE INDEX idx_feedback_user_id ON feedback(user_id);
      CREATE INDEX idx_feedback_course_id ON feedback(course_id);
      CREATE INDEX idx_feedback_created_at ON feedback(created_at);
    `);

    // Notifications table indexes
    await queryRunner.query(`
      CREATE INDEX idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX idx_notifications_type ON notifications(type);
      CREATE INDEX idx_notifications_status ON notifications(status);
      CREATE INDEX idx_notifications_created_at ON notifications(created_at);
    `);

    // Notification preferences table indexes
    await queryRunner.query(`
      CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
    `);

    // Add partial indexes for frequently queried conditions
    await queryRunner.query(`
      CREATE INDEX idx_users_active_students ON users(role, status) WHERE role = 'student' AND status = 'active';
      CREATE INDEX idx_courses_published ON courses(status) WHERE status = 'published';
      CREATE INDEX idx_enrollments_active ON enrollments(status) WHERE status = 'enrolled';
      CREATE INDEX idx_notifications_unread ON notifications(status) WHERE status = 'unread';
    `);

    // Add composite indexes for common join operations
    await queryRunner.query(`
      CREATE INDEX idx_course_enrollment ON enrollments(course_id, user_id);
      CREATE INDEX idx_module_lesson ON lessons(module_id, order_index);
      CREATE INDEX idx_assessment_question ON questions(assessment_id, order_index);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all indexes in reverse order
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_course_enrollment;
      DROP INDEX IF EXISTS idx_module_lesson;
      DROP INDEX IF EXISTS idx_assessment_question;
      DROP INDEX IF EXISTS idx_users_active_students;
      DROP INDEX IF EXISTS idx_courses_published;
      DROP INDEX IF EXISTS idx_enrollments_active;
      DROP INDEX IF EXISTS idx_notifications_unread;
      DROP INDEX IF EXISTS idx_notification_preferences_user_id;
      DROP INDEX IF EXISTS idx_notifications_user_id;
      DROP INDEX IF EXISTS idx_notifications_type;
      DROP INDEX IF EXISTS idx_notifications_status;
      DROP INDEX IF EXISTS idx_notifications_created_at;
      DROP INDEX IF EXISTS idx_feedback_user_id;
      DROP INDEX IF EXISTS idx_feedback_course_id;
      DROP INDEX IF EXISTS idx_feedback_created_at;
      DROP INDEX IF EXISTS idx_certificates_user_id;
      DROP INDEX IF EXISTS idx_certificates_course_id;
      DROP INDEX IF EXISTS idx_certificates_created_at;
      DROP INDEX IF EXISTS idx_attempts_user_id;
      DROP INDEX IF EXISTS idx_attempts_assessment_id;
      DROP INDEX IF EXISTS idx_attempts_created_at;
      DROP INDEX IF EXISTS idx_questions_assessment_id;
      DROP INDEX IF EXISTS idx_questions_order_index;
      DROP INDEX IF EXISTS idx_assessments_course_id;
      DROP INDEX IF EXISTS idx_progress_enrollment_id;
      DROP INDEX IF EXISTS idx_progress_lesson_id;
      DROP INDEX IF EXISTS idx_progress_status;
      DROP INDEX IF EXISTS idx_enrollments_user_id;
      DROP INDEX IF EXISTS idx_enrollments_course_id;
      DROP INDEX IF EXISTS idx_enrollments_status;
      DROP INDEX IF EXISTS idx_enrollments_created_at;
      DROP INDEX IF EXISTS idx_lessons_module_id;
      DROP INDEX IF EXISTS idx_lessons_order_index;
      DROP INDEX IF EXISTS idx_modules_course_id;
      DROP INDEX IF EXISTS idx_modules_order_index;
      DROP INDEX IF EXISTS idx_courses_instructor_id;
      DROP INDEX IF EXISTS idx_courses_category;
      DROP INDEX IF EXISTS idx_courses_level;
      DROP INDEX IF EXISTS idx_courses_status;
      DROP INDEX IF EXISTS idx_courses_created_at;
      DROP INDEX IF EXISTS idx_users_email;
      DROP INDEX IF EXISTS idx_users_role;
      DROP INDEX IF EXISTS idx_users_status;
      DROP INDEX IF EXISTS idx_users_created_at;
    `);
  }
} 