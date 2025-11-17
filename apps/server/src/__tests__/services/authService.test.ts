import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authService } from '../../services/authService';
import { userRepository } from '../../repositories/userRepository';
import { AppError } from '../../utils/appError';
import { env } from '../../config/env';

jest.mock('../../repositories/userRepository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user and return token', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashed_password';
      const userId = 'user-123';
      const token = 'jwt-token';

      const mockUser = {
        id: userId,
        email,
        password_hash: hashedPassword,
        created_at: new Date().toISOString(),
      };

      mockUserRepository.findByEmail.mockReturnValue(undefined);
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockJwt.sign.mockImplementation(() => token);

      const result = await authService.signup(email, password);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith(email, hashedPassword);
      expect(mockJwt.sign).toHaveBeenCalledWith({ sub: userId }, env.jwtSecret, { expiresIn: '1h' });
      expect(result).toEqual({
        user: {
          id: userId,
          email,
          createdAt: mockUser.created_at,
        },
        token,
      });
    });

    it('should throw AppError if email already exists', async () => {
      const email = 'existing@example.com';
      const password = 'password123';

      const existingUser = {
        id: 'user-123',
        email,
        password_hash: 'hash',
        created_at: new Date().toISOString(),
      };

      mockUserRepository.findByEmail.mockReturnValue(existingUser);

      await expect(authService.signup(email, password)).rejects.toThrow(AppError);
      await expect(authService.signup(email, password)).rejects.toThrow('Email already registered');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const userId = 'user-123';
      const token = 'jwt-token';

      const mockUser = {
        id: userId,
        email,
        password_hash: 'hashed_password',
        created_at: new Date().toISOString(),
      };

      mockUserRepository.findByEmail.mockReturnValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwt.sign.mockImplementation(() => token);

      const result = await authService.login(email, password);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, mockUser.password_hash);
      expect(mockJwt.sign).toHaveBeenCalledWith({ sub: userId }, env.jwtSecret, { expiresIn: '1h' });
      expect(result).toEqual({
        user: {
          id: userId,
          email,
          createdAt: mockUser.created_at,
        },
        token,
      });
    });

    it('should throw AppError if user does not exist', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      mockUserRepository.findByEmail.mockReturnValue(undefined);

      await expect(authService.login(email, password)).rejects.toThrow(AppError);
      await expect(authService.login(email, password)).rejects.toThrow('Invalid credentials');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw AppError if password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      const mockUser = {
        id: 'user-123',
        email,
        password_hash: 'hashed_password',
        created_at: new Date().toISOString(),
      };

      mockUserRepository.findByEmail.mockReturnValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(authService.login(email, password)).rejects.toThrow(AppError);
      await expect(authService.login(email, password)).rejects.toThrow('Invalid credentials');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, mockUser.password_hash);
      expect(mockJwt.sign).not.toHaveBeenCalled();
    });
  });
});

