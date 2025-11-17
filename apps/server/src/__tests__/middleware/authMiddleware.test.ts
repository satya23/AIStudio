import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../../middleware/authMiddleware';
import { AppError } from '../../utils/appError';
import { env } from '../../config/env';

jest.mock('jsonwebtoken');

const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('authMiddleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      headers: {},
    };

    mockRes = {};

    mockNext = jest.fn();
  });

  it('should set userId when valid token is provided', () => {
    const token = 'valid-token';
    const userId = 'user-123';
    const payload = { sub: userId };

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    mockJwt.verify.mockReturnValue(payload as any);

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockJwt.verify).toHaveBeenCalledWith(token, env.jwtSecret);
    expect(mockReq.userId).toBe(userId);
    expect(mockNext).toHaveBeenCalledWith();
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should throw AppError when authorization header is missing', () => {
    mockReq.headers = {};

    expect(() => {
      authMiddleware(mockReq as Request, mockRes as Response, mockNext);
    }).toThrow(AppError);

    expect(() => {
      authMiddleware(mockReq as Request, mockRes as Response, mockNext);
    }).toThrow('Unauthorized');

    expect(mockJwt.verify).not.toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should throw AppError when authorization header does not start with Bearer', () => {
    mockReq.headers = {
      authorization: 'Invalid token',
    };

    expect(() => {
      authMiddleware(mockReq as Request, mockRes as Response, mockNext);
    }).toThrow(AppError);

    expect(() => {
      authMiddleware(mockReq as Request, mockRes as Response, mockNext);
    }).toThrow('Unauthorized');

    expect(mockJwt.verify).not.toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should throw AppError when token is invalid', () => {
    const token = 'invalid-token';

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    mockJwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    expect(() => {
      authMiddleware(mockReq as Request, mockRes as Response, mockNext);
    }).toThrow(AppError);

    expect(() => {
      authMiddleware(mockReq as Request, mockRes as Response, mockNext);
    }).toThrow('Unauthorized');

    expect(mockJwt.verify).toHaveBeenCalledWith(token, env.jwtSecret);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should throw AppError when token is expired', () => {
    const token = 'expired-token';

    mockReq.headers = {
      authorization: `Bearer ${token}`,
    };

    mockJwt.verify.mockImplementation(() => {
      const error = new Error('Token expired') as any;
      error.name = 'TokenExpiredError';
      throw error;
    });

    expect(() => {
      authMiddleware(mockReq as Request, mockRes as Response, mockNext);
    }).toThrow(AppError);

    expect(() => {
      authMiddleware(mockReq as Request, mockRes as Response, mockNext);
    }).toThrow('Unauthorized');

    expect(mockJwt.verify).toHaveBeenCalledWith(token, env.jwtSecret);
    expect(mockNext).not.toHaveBeenCalled();
  });
});

