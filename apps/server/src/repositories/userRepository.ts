import { randomUUID } from 'crypto';
import db from '../db';

export type UserRecord = {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
};

export const userRepository = {
  create(email: string, passwordHash: string): UserRecord {
    const stmt = db.prepare(
      `INSERT INTO users (id, email, password_hash, created_at)
       VALUES (@id, @email, @password_hash, @created_at)`,
    );

    const record: UserRecord = {
      id: randomUUID(),
      email,
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
    };

    stmt.run(record);
    return record;
  },

  findByEmail(email: string): UserRecord | undefined {
    return db.prepare(`SELECT * FROM users WHERE email = ?`).get(email) as UserRecord | undefined;
  },

  findById(id: string): UserRecord | undefined {
    return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as UserRecord | undefined;
  },
};
