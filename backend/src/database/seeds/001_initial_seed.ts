import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class InitialSeed1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await queryRunner.query(`
      INSERT INTO users (email, password, first_name, last_name, role, status)
      VALUES ('admin@example.com', $1, 'Admin', 'User', 'admin', 'active')
      RETURNING id;
    `, [adminPassword]);

    // Insert instructor users
    const instructorPassword = await bcrypt.hash('instructor123', 10);
    const instructorResult = await queryRunner.query(`
      INSERT INTO users (email, password, first_name, last_name, role, status)
      VALUES ('instructor@example.com', $1, 'John', 'Doe', 'instructor', 'active')
      RETURNING id;
    `, [instructorPassword]);
    const instructorId = instructorResult[0].id;

    // Insert student users
    const studentPassword = await bcrypt.hash('student123', 10);
    const studentResult = await queryRunner.query(`
      INSERT INTO users (email, password, first_name, last_name, role, status)
      VALUES ('student@example.com', $1, 'Jane', 'Smith', 'student', 'active')
      RETURNING id;
    `, [studentPassword]);
    const studentId = studentResult[0].id;

    // Insert courses
    const courseResult = await queryRunner.query(`
      INSERT INTO courses (title, description, instructor_id, category, level, duration, price, status)
      VALUES 
        ('Introduction to Programming', 'Learn the basics of programming', $1, 'Programming', 'beginner', 30, 49.99, 'published'),
        ('Advanced Web Development', 'Master modern web development', $1, 'Web Development', 'advanced', 60, 99.99, 'published')
      RETURNING id;
    `, [instructorId]);
    const [course1Id, course2Id] = courseResult.map((row: any) => row.id);

    // Insert modules for course 1
    const moduleResult = await queryRunner.query(`
      INSERT INTO modules (course_id, title, description, order_index)
      VALUES 
        ($1, 'Getting Started', 'Introduction to programming concepts', 1),
        ($1, 'Variables and Data Types', 'Understanding basic data types', 2)
      RETURNING id;
    `, [course1Id]);
    const [module1Id, module2Id] = moduleResult.map((row: any) => row.id);

    // Insert lessons for module 1
    await queryRunner.query(`
      INSERT INTO lessons (module_id, title, content, video_url, duration, order_index)
      VALUES 
        ($1, 'What is Programming?', 'Introduction to programming concepts', 'https://example.com/video1', 15, 1),
        ($1, 'Setting Up Your Environment', 'How to set up your development environment', 'https://example.com/video2', 20, 2);
    `, [module1Id]);

    // Insert assessments
    const assessmentResult = await queryRunner.query(`
      INSERT INTO assessments (course_id, title, description, passing_score, time_limit)
      VALUES 
        ($1, 'Programming Basics Quiz', 'Test your understanding of basic programming concepts', 70, 30),
        ($2, 'Web Development Final Exam', 'Comprehensive test of web development skills', 80, 60)
      RETURNING id;
    `, [course1Id, course2Id]);
    const [assessment1Id, assessment2Id] = assessmentResult.map((row: any) => row.id);

    // Insert questions for assessment 1
    await queryRunner.query(`
      INSERT INTO questions (assessment_id, question_text, question_type, options, correct_answer, points, order_index)
      VALUES 
        ($1, 'What is a variable?', 'multiple_choice', 
         '{"A": "A container for storing data", "B": "A type of function", "C": "A programming language"}', 
         'A', 10, 1),
        ($1, 'Which of these is a data type?', 'multiple_choice',
         '{"A": "String", "B": "Loop", "C": "Function"}',
         'A', 10, 2);
    `, [assessment1Id]);

    // Insert enrollments
    await queryRunner.query(`
      INSERT INTO enrollments (user_id, course_id, status)
      VALUES 
        ($1, $2, 'enrolled'),
        ($1, $3, 'in_progress');
    `, [studentId, course1Id, course2Id]);

    // Insert progress
    await queryRunner.query(`
      INSERT INTO progress (enrollment_id, lesson_id, status, time_spent)
      VALUES 
        ($1, $2, 'completed', 900),
        ($1, $3, 'in_progress', 300);
    `, [studentId, module1Id, module2Id]);

    // Insert feedback
    await queryRunner.query(`
      INSERT INTO feedback (user_id, course_id, rating, comment)
      VALUES 
        ($1, $2, 5, 'Great course! Very informative and well-structured.');
    `, [studentId, course1Id]);

    // Insert notification preferences
    await queryRunner.query(`
      INSERT INTO notification_preferences (user_id, email, push, frequency, categories)
      VALUES 
        ($1, true, true, 'instant', '["course_updates", "assessment_results", "certificates"]'),
        ($2, true, true, 'daily', '["course_updates", "assessment_results", "certificates"]'),
        ($3, true, true, 'weekly', '["course_updates", "assessment_results", "certificates"]');
    `, [adminPassword, instructorId, studentId]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM notification_preferences');
    await queryRunner.query('DELETE FROM feedback');
    await queryRunner.query('DELETE FROM progress');
    await queryRunner.query('DELETE FROM enrollments');
    await queryRunner.query('DELETE FROM questions');
    await queryRunner.query('DELETE FROM assessments');
    await queryRunner.query('DELETE FROM lessons');
    await queryRunner.query('DELETE FROM modules');
    await queryRunner.query('DELETE FROM courses');
    await queryRunner.query('DELETE FROM users');
  }
} 