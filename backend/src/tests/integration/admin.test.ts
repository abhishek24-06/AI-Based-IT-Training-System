import request from 'supertest';
import { app } from '../../app';
import { getConnection } from 'typeorm';
import { User } from '../../entities/User';
import { Course } from '../../entities/Course';
import { Enrollment } from '../../entities/Enrollment';
import { Feedback } from '../../entities/Feedback';
import { createTestUser, createTestCourse, createTestEnrollment } from '../utils/testUtils';

describe('Admin API Integration Tests', () => {
  let adminToken: string;
  let instructorToken: string;
  let studentToken: string;
  let adminUser: User;
  let instructorUser: User;
  let studentUser: User;
  let testCourse: Course;
  let testEnrollment: Enrollment;

  beforeAll(async () => {
    // Create test users
    adminUser = await createTestUser('admin@example.com', 'admin', 'admin');
    instructorUser = await createTestUser('instructor@example.com', 'instructor', 'instructor');
    studentUser = await createTestUser('student@example.com', 'student', 'student');

    // Create test course
    testCourse = await createTestCourse(instructorUser.id);
    testEnrollment = await createTestEnrollment(studentUser.id, testCourse.id);

    // Get tokens
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password' });
    adminToken = adminResponse.body.token;

    const instructorResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'instructor@example.com', password: 'password' });
    instructorToken = instructorResponse.body.token;

    const studentResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@example.com', password: 'password' });
    studentToken = studentResponse.body.token;
  });

  afterAll(async () => {
    const connection = getConnection();
    await connection.close();
  });

  describe('User Management', () => {
    it('should get all users (admin only)', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    it('should update user status (admin only)', async () => {
      const response = await request(app)
        .patch(`/api/admin/users/${studentUser.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'suspended' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should delete user (admin only)', async () => {
      const response = await request(app)
        .delete(`/api/admin/users/${studentUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Course Approval', () => {
    it('should get pending courses (admin only)', async () => {
      const response = await request(app)
        .get('/api/admin/courses/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('courses');
      expect(Array.isArray(response.body.courses)).toBe(true);
    });

    it('should approve course (admin only)', async () => {
      const response = await request(app)
        .post(`/api/admin/courses/${testCourse.id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('should reject course (admin only)', async () => {
      const response = await request(app)
        .post(`/api/admin/courses/${testCourse.id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Analytics', () => {
    it('should get analytics data (admin only)', async () => {
      const response = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total_users');
      expect(response.body).toHaveProperty('total_courses');
      expect(response.body).toHaveProperty('total_assessments');
      expect(response.body).toHaveProperty('total_certificates');
    });
  });

  describe('Access Control', () => {
    it('should deny access to non-admin users', async () => {
      const endpoints = [
        { method: 'GET', path: '/api/admin/users' },
        { method: 'PATCH', path: `/api/admin/users/${studentUser.id}/status` },
        { method: 'DELETE', path: `/api/admin/users/${studentUser.id}` },
        { method: 'GET', path: '/api/admin/courses/pending' },
        { method: 'POST', path: `/api/admin/courses/${testCourse.id}/approve` },
        { method: 'POST', path: `/api/admin/courses/${testCourse.id}/reject` },
        { method: 'GET', path: '/api/admin/analytics' },
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          [endpoint.method.toLowerCase()](endpoint.path)
          .set('Authorization', `Bearer ${instructorToken}`);

        expect(response.status).toBe(403);
      }
    });

    it('should require authentication', async () => {
      const endpoints = [
        { method: 'GET', path: '/api/admin/users' },
        { method: 'PATCH', path: `/api/admin/users/${studentUser.id}/status` },
        { method: 'DELETE', path: `/api/admin/users/${studentUser.id}` },
        { method: 'GET', path: '/api/admin/courses/pending' },
        { method: 'POST', path: `/api/admin/courses/${testCourse.id}/approve` },
        { method: 'POST', path: `/api/admin/courses/${testCourse.id}/reject` },
        { method: 'GET', path: '/api/admin/analytics' },
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          [endpoint.method.toLowerCase()](endpoint.path);

        expect(response.status).toBe(401);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid user ID', async () => {
      const response = await request(app)
        .patch('/api/admin/users/invalid-id/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'suspended' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid course ID', async () => {
      const response = await request(app)
        .post('/api/admin/courses/invalid-id/approve')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid status update', async () => {
      const response = await request(app)
        .patch(`/api/admin/users/${studentUser.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid-status' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 