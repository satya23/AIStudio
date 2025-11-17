import { Request, Response } from 'express';
import { signup, login } from '../../controllers/authController';
import { authService } from '../../services/authService';
import { signupSchema, loginSchema } from '../../validators/authSchemas';
import { ZodError } from 'zod';

jest.mock('../../services/authService');

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('authController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('signup', () => {
    it('should call authService.signup and return 201 with result', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockResult = {
        user: { id: 'user-123', email, createdAt: new Date().toISOString() },
        token: 'jwt-token',
      };

      mockReq.body = { email, password };
      jest.spyOn(signupSchema, 'parse').mockReturnValue({ email, password });
      mockAuthService.signup.mockResolvedValue(mockResult);

      const handler = signup as any;
      await handler(mockReq, mockRes, mockNext);

      expect(signupSchema.parse).toHaveBeenCalledWith(mockReq.body);
      expect(mockAuthService.signup).toHaveBeenCalledWith(email, password);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const validationError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          path: ['email'],
          message: 'Expected string, received number',
        } as any,
      ]);

      mockReq.body = { email: 123, password: 'pass' };
      jest.spyOn(signupSchema, 'parse').mockImplementation(() => {
        throw validationError;
      });

      const handler = signup as any;
      await handler(mockReq, mockRes, mockNext);

      expect(signupSchema.parse).toHaveBeenCalledWith(mockReq.body);
      expect(mockAuthService.signup).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(validationError);
    });

    it('should handle service errors', async () => {
      const email = 'existing@example.com';
      const password = 'password123';
      const serviceError = new Error('Email already registered');

      mockReq.body = { email, password };
      jest.spyOn(signupSchema, 'parse').mockReturnValue({ email, password });
      mockAuthService.signup.mockRejectedValue(serviceError);

      const handler = signup as any;
      await handler(mockReq, mockRes, mockNext);
      await new Promise((resolve) => setImmediate(resolve));

      expect(signupSchema.parse).toHaveBeenCalledWith(mockReq.body);
      expect(mockAuthService.signup).toHaveBeenCalledWith(email, password);
      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('login', () => {
    it('should call authService.login and return 200 with result', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockResult = {
        user: { id: 'user-123', email, createdAt: new Date().toISOString() },
        token: 'jwt-token',
      };

      mockReq.body = { email, password };
      jest.spyOn(loginSchema, 'parse').mockReturnValue({ email, password });
      mockAuthService.login.mockResolvedValue(mockResult);

      const handler = login as any;
      await handler(mockReq, mockRes, mockNext);

      expect(loginSchema.parse).toHaveBeenCalledWith(mockReq.body);
      expect(mockAuthService.login).toHaveBeenCalledWith(email, password);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const validationError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          path: ['email'],
          message: 'Required',
        } as any,
      ]);

      mockReq.body = { password: 'pass' };
      jest.spyOn(loginSchema, 'parse').mockImplementation(() => {
        throw validationError;
      });

      const handler = login as any;
      await handler(mockReq, mockRes, mockNext);

      expect(loginSchema.parse).toHaveBeenCalledWith(mockReq.body);
      expect(mockAuthService.login).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(validationError);
    });

    it('should handle service errors', async () => {
      const email = 'wrong@example.com';
      const password = 'wrongpassword';
      const serviceError = new Error('Invalid credentials');

      mockReq.body = { email, password };
      jest.spyOn(loginSchema, 'parse').mockReturnValue({ email, password });
      mockAuthService.login.mockRejectedValue(serviceError);

      const handler = login as any;
      await handler(mockReq, mockRes, mockNext);
      await new Promise((resolve) => setImmediate(resolve));

      expect(loginSchema.parse).toHaveBeenCalledWith(mockReq.body);
      expect(mockAuthService.login).toHaveBeenCalledWith(email, password);
      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });
});

