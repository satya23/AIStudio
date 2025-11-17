import request from 'supertest';
import app from '../app';

describe('Auth API', () => {
  const baseUser = { email: 'user@example.com', password: 'SuperSecret1' };

  it('signs up a new user', async () => {
    const res = await request(app).post('/auth/signup').send(baseUser).expect(201);
    expect(res.body).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({
          email: baseUser.email,
          id: expect.any(String),
        }),
      }),
    );
  });

  it('prevents duplicate signup', async () => {
    await request(app).post('/auth/signup').send(baseUser);
    const res = await request(app).post('/auth/signup').send(baseUser).expect(409);
    expect(res.body.message).toMatch(/already/);
  });

  it('validates payload', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .send({ email: 'not-an-email', password: '123' })
      .expect(400);
    expect(res.body.message).toBe('Validation error');
  });

  it('logs in existing user', async () => {
    await request(app).post('/auth/signup').send(baseUser);
    const res = await request(app).post('/auth/login').send(baseUser).expect(200);
    expect(res.body.token).toEqual(expect.any(String));
  });

  it('rejects invalid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'missing@example.com', password: 'password123' })
      .expect(401);
    expect(res.body.message).toBe('Invalid credentials');
  });
});
