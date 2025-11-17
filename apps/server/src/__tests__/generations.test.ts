import fs from 'fs';
import path from 'path';
import request from 'supertest';
import app from '../app';
import { generationRepository } from '../repositories/generationRepository';

const sampleBuffer = Buffer.from(
  '89504e470d0a1a0a0000000d4948445200000001000000010802000000907724' +
    '0000000a49444154789c6360000002000100ffff03000006000557bf00000000' +
    '49454e44ae426082',
  'hex',
);

const createTestImage = () => {
  const filePath = path.join(__dirname, 'test.png');
  fs.writeFileSync(filePath, sampleBuffer);
  return filePath;
};

const signupAndLogin = async () => {
  const credentials = {
    email: `user+${Date.now()}@example.com`,
    password: 'Password123!',
  };
  const signupRes = await request(app).post('/auth/signup').send(credentials);
  const loginRes = await request(app).post('/auth/login').send(credentials);
  return {
    token: loginRes.body.token as string,
    userId: signupRes.body.user.id as string,
  };
};

describe('Generation API', () => {
  it('requires authentication', async () => {
    await request(app).get('/generations').expect(401);
  });

  it('creates a generation successfully', async () => {
    const { token } = await signupAndLogin();
    const imagePath = createTestImage();

    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const res = await request(app)
      .post('/generations')
      .set('Authorization', `Bearer ${token}`)
      .field('prompt', 'Create a futuristic gown')
      .field('style', 'Avant-garde')
      .attach('image', imagePath)
      .expect(201);

    expect(res.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        prompt: 'Create a futuristic gown',
        style: 'Avant-garde',
        imageUrl: expect.stringContaining('/uploads/'),
        status: 'completed',
      }),
    );

    const list = await request(app)
      .get('/generations')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(list.body.items).toHaveLength(1);

    (Math.random as jest.MockedFunction<typeof Math.random>).mockRestore();
  });

  it('simulates overload errors', async () => {
    const { token } = await signupAndLogin();
    const imagePath = createTestImage();

    jest.spyOn(Math, 'random').mockReturnValue(0.05);

    const res = await request(app)
      .post('/generations')
      .set('Authorization', `Bearer ${token}`)
      .field('prompt', 'Retry scenario')
      .field('style', 'Formal')
      .attach('image', imagePath)
      .expect(503);

    expect(res.body.message).toBe('Model overloaded');

    (Math.random as jest.MockedFunction<typeof Math.random>).mockRestore();
  });

  it('respects the limit parameter when listing generations', async () => {
    const { token, userId } = await signupAndLogin();

    const prompts = ['First look', 'Second look', 'Third look'];
    prompts.forEach((prompt, index) => {
      generationRepository.create({
        user_id: userId,
        prompt,
        style: 'Minimalist',
        image_url: `/uploads/seed-${index}.png`,
        status: 'completed',
      });
    });

    const res = await request(app)
      .get('/generations?limit=2')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.items).toHaveLength(2);
    const returnedPrompts = res.body.items.map((item: { prompt: string }) => item.prompt);
    expect(returnedPrompts).not.toContain('Third look');
    returnedPrompts.forEach((prompt: string) => {
      expect(prompts).toContain(prompt);
    });
  });

  it('rejects invalid list limits', async () => {
    const { token } = await signupAndLogin();

    const res = await request(app)
      .get('/generations?limit=100')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(res.body.message).toBe('Validation error');
  });
});
