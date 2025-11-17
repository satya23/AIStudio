import fs from 'fs';
import path from 'path';

const tmpDir = path.resolve(__dirname, '../../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

const uploadsDir = path.join(tmpDir, 'uploads');
const dbPath = path.join(tmpDir, 'test.sqlite');

if (fs.existsSync(dbPath)) {
  fs.rmSync(dbPath);
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

process.env.JWT_SECRET = 'test-secret';
process.env.DB_PATH = dbPath;
process.env.UPLOADS_DIR = uploadsDir;
process.env.PORT = '0';
