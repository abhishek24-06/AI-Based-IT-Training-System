import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdditionalOptimizations1700000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create materialized views for frequently accessed data
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW mv_course_statistics AS
      SELECT 
        c.id as course_id,
        c.title,
        COUNT(DISTINCT e.id) as total_enrollments,
        COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.id END) as completed_enrollments,
        AVG(f.rating) as average_rating,
        COUNT(DISTINCT f.id) as total_reviews
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN feedback f ON c.id = f.course_id
      GROUP BY c.id, c.title;

      CREATE MATERIALIZED VIEW mv_user_progress AS
      SELECT 
        u.id as user_id,
        u.email,
        COUNT(DISTINCT e.course_id) as total_courses,
        COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.course_id END) as completed_courses,
        SUM(p.time_spent) as total_time_spent,
        COUNT(DISTINCT c.id) as total_certificates
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.user_id
      LEFT JOIN progress p ON e.id = p.enrollment_id
      LEFT JOIN certificates c ON u.id = c.user_id
      GROUP BY u.id, u.email;

      CREATE MATERIALIZED VIEW mv_instructor_performance AS
      SELECT 
        u.id as instructor_id,
        u.email,
        COUNT(DISTINCT c.id) as total_courses,
        COUNT(DISTINCT e.id) as total_enrollments,
        AVG(f.rating) as average_rating,
        SUM(c.price) as total_revenue
      FROM users u
      JOIN courses c ON u.id = c.instructor_id
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN feedback f ON c.id = f.course_id
      GROUP BY u.id, u.email;
    `);

    // Create function to refresh materialized views
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION refresh_materialized_views()
      RETURNS void AS $$
      BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_course_statistics;
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_progress;
        REFRESH MATERIALIZED VIEW CONCURRENTLY mv_instructor_performance;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create triggers for automatic view refresh
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION refresh_course_statistics_trigger()
      RETURNS TRIGGER AS $$
      BEGIN
        PERFORM refresh_materialized_views();
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER refresh_course_statistics
      AFTER INSERT OR UPDATE OR DELETE ON enrollments
      FOR EACH STATEMENT
      EXECUTE FUNCTION refresh_course_statistics_trigger();

      CREATE TRIGGER refresh_user_progress
      AFTER INSERT OR UPDATE OR DELETE ON progress
      FOR EACH STATEMENT
      EXECUTE FUNCTION refresh_course_statistics_trigger();

      CREATE TRIGGER refresh_instructor_performance
      AFTER INSERT OR UPDATE OR DELETE ON courses
      FOR EACH STATEMENT
      EXECUTE FUNCTION refresh_course_statistics_trigger();
    `);

    // Add table partitioning for large tables
    await queryRunner.query(`
      -- Partition notifications table by created_at
      CREATE TABLE notifications_partitioned (
        LIKE notifications INCLUDING ALL
      ) PARTITION BY RANGE (created_at);

      CREATE TABLE notifications_y2024 PARTITION OF notifications_partitioned
        FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
      CREATE TABLE notifications_y2025 PARTITION OF notifications_partitioned
        FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

      -- Partition progress table by enrollment_id
      CREATE TABLE progress_partitioned (
        LIKE progress INCLUDING ALL
      ) PARTITION BY HASH (enrollment_id);

      CREATE TABLE progress_p0 PARTITION OF progress_partitioned
        FOR VALUES WITH (MODULUS 4, REMAINDER 0);
      CREATE TABLE progress_p1 PARTITION OF progress_partitioned
        FOR VALUES WITH (MODULUS 4, REMAINDER 1);
      CREATE TABLE progress_p2 PARTITION OF progress_partitioned
        FOR VALUES WITH (MODULUS 4, REMAINDER 2);
      CREATE TABLE progress_p3 PARTITION OF progress_partitioned
        FOR VALUES WITH (MODULUS 4, REMAINDER 3);
    `);

    // Add function-based indexes for case-insensitive searches
    await queryRunner.query(`
      CREATE INDEX idx_users_email_lower ON users (LOWER(email));
      CREATE INDEX idx_courses_title_lower ON courses (LOWER(title));
      CREATE INDEX idx_courses_description_lower ON courses (LOWER(description));
    `);

    // Add GIN indexes for JSONB columns
    await queryRunner.query(`
      CREATE INDEX idx_questions_options_gin ON questions USING GIN (options);
      CREATE INDEX idx_notification_preferences_categories_gin 
        ON notification_preferences USING GIN (categories);
    `);

    // Add BRIN indexes for timestamp columns in large tables
    await queryRunner.query(`
      CREATE INDEX idx_notifications_created_at_brin 
        ON notifications USING BRIN (created_at);
      CREATE INDEX idx_progress_last_accessed_at_brin 
        ON progress USING BRIN (last_accessed_at);
    `);

    // Add foreign key indexes for better join performance
    await queryRunner.query(`
      CREATE INDEX idx_lessons_module_id_fk ON lessons (module_id);
      CREATE INDEX idx_modules_course_id_fk ON modules (course_id);
      CREATE INDEX idx_enrollments_course_id_fk ON enrollments (course_id);
      CREATE INDEX idx_enrollments_user_id_fk ON enrollments (user_id);
    `);

    // Add partial indexes for soft delete
    await queryRunner.query(`
      CREATE INDEX idx_users_active ON users (id) WHERE status = 'active';
      CREATE INDEX idx_courses_published ON courses (id) WHERE status = 'published';
    `);

    // Add covering indexes for common queries
    await queryRunner.query(`
      CREATE INDEX idx_course_search ON courses (category, level, status) INCLUDE (title, description);
      CREATE INDEX idx_user_search ON users (role, status) INCLUDE (email, first_name, last_name);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop materialized views
    await queryRunner.query(`
      DROP MATERIALIZED VIEW IF EXISTS mv_course_statistics;
      DROP MATERIALIZED VIEW IF EXISTS mv_user_progress;
      DROP MATERIALIZED VIEW IF EXISTS mv_instructor_performance;
    `);

    // Drop triggers and functions
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS refresh_course_statistics ON enrollments;
      DROP TRIGGER IF EXISTS refresh_user_progress ON progress;
      DROP TRIGGER IF EXISTS refresh_instructor_performance ON courses;
      DROP FUNCTION IF EXISTS refresh_materialized_views();
      DROP FUNCTION IF EXISTS refresh_course_statistics_trigger();
    `);

    // Drop partitioned tables
    await queryRunner.query(`
      DROP TABLE IF EXISTS notifications_partitioned CASCADE;
      DROP TABLE IF EXISTS progress_partitioned CASCADE;
    `);

    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_users_email_lower;
      DROP INDEX IF EXISTS idx_courses_title_lower;
      DROP INDEX IF EXISTS idx_courses_description_lower;
      DROP INDEX IF EXISTS idx_questions_options_gin;
      DROP INDEX IF EXISTS idx_notification_preferences_categories_gin;
      DROP INDEX IF EXISTS idx_notifications_created_at_brin;
      DROP INDEX IF EXISTS idx_progress_last_accessed_at_brin;
      DROP INDEX IF EXISTS idx_lessons_module_id_fk;
      DROP INDEX IF EXISTS idx_modules_course_id_fk;
      DROP INDEX IF EXISTS idx_enrollments_course_id_fk;
      DROP INDEX IF EXISTS idx_enrollments_user_id_fk;
      DROP INDEX IF EXISTS idx_users_active;
      DROP INDEX IF EXISTS idx_courses_published;
      DROP INDEX IF EXISTS idx_course_search;
      DROP INDEX IF EXISTS idx_user_search;
    `);
  }
} 