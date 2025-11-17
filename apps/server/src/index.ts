import http from 'http';
import app from './app';
import { env } from './config/env';

const server = http.createServer(app);

const PORT = env.port;

server.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
