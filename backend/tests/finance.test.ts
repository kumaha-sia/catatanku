import request from 'supertest';
import app from '../src/app';
import prisma from '../src/db';

describe('API Health Check', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return API is running', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('FinBareng API is running');
  });
});
