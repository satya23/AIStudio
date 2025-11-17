import { randomUUID } from 'crypto';
import db from '../db';

export type GenerationRecord = {
  id: string;
  user_id: string;
  prompt: string;
  style: string;
  image_url: string;
  created_at: string;
  status: string;
};

export const generationRepository = {
  create(input: Omit<GenerationRecord, 'id' | 'created_at'>): GenerationRecord {
    const record: GenerationRecord = {
      id: randomUUID(),
      created_at: new Date().toISOString(),
      ...input,
    };

    db.prepare(
      `INSERT INTO generations (id, user_id, prompt, style, image_url, created_at, status)
       VALUES (@id, @user_id, @prompt, @style, @image_url, @created_at, @status)`,
    ).run(record);

    return record;
  },

  listByUser(userId: string, limit: number): GenerationRecord[] {
    return db
      .prepare(
        `SELECT * FROM generations
         WHERE user_id = ?
         ORDER BY datetime(created_at) DESC
         LIMIT ?`,
      )
      .all(userId, limit) as GenerationRecord[];
  },
};
