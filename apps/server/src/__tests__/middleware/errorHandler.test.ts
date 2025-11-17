import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { errorHandler } from '../../middleware/errorHandler';
import { AppError } from '../../utils/appError';

describe('errorHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {};

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should handle ZodError with 400 status', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          path: ['email'],
          message: 'Expected string, received number',
        } as any,
        {
          code: 'too_small',
          minimum: 8,
          inclusive: true,
          path: ['password'],
          message: 'String must contain at least 8 character(s)',
        } as any,
      ]);

    errorHandler(zodError, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Validation error',
      issues: zodError.flatten().fieldErrors,
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle AppError with custom status code', () => {
    const appError = new AppError('Email already registered', 409);

    errorHandler(appError, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Email already registered',
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle AppError with default 400 status code', () => {
    const appError = new AppError('Bad request');

    errorHandler(appError, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Bad request',
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle unexpected errors with 500 status', () => {
    const unexpectedError = new Error('Unexpected error');

    errorHandler(unexpectedError, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Unexpected error',
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(unexpectedError);
  });

  it('should handle non-Error objects with 500 status', () => {
    const nonError = { some: 'object' };

    errorHandler(nonError, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Unexpected error',
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(nonError);
  });

  it('should handle null/undefined errors with 500 status', () => {
    errorHandler(null, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Unexpected error',
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(null);
  });
});

