import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const workspaceRoot = path.resolve(__dirname, '../../..');
const uploadsDir = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(workspaceRoot, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  uploadsDir,
  dbPath: process.env.DB_PATH
    ? path.resolve(process.env.DB_PATH)
    : path.join(workspaceRoot, 'data', 'aistudio.sqlite'),
};
