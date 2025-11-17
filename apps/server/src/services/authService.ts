import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

const SALT_ROUNDS = 10;

export const authService = {
  async signup(email: string, password: string) {
    const existing = userRepository.findByEmail(email);
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = userRepository.create(email, passwordHash);
    const token = generateToken(user.id);

    return { user: sanitizeUser(user), token };
  },

  async login(email: string, password: string) {
    const user = userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = generateToken(user.id);
    return { user: sanitizeUser(user), token };
  },
};

const generateToken = (userId: string) =>
  jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: '1h' });

const sanitizeUser = (user: { id: string; email: string; created_at: string }) => ({
  id: user.id,
  email: user.email,
  createdAt: user.created_at,
});
