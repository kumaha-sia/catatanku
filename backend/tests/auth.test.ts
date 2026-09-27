import request from 'supertest';
import app from '../src/app';
import prisma from '../src/db';
import bcrypt from 'bcrypt';

describe('Auth API', () => {
  const testUser = {
    name: 'Test User',
    email: 'testauth@example.com',
    password: 'password123'
  };

  beforeAll(async () => {
    // Clean up if user already exists
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return error if email already exists', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login user successfully and return token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return 401 for wrong password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });
  });
});
