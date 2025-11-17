import { Request, Response } from 'express';
import fs from 'fs';
import { createGeneration, listGenerations } from '../../controllers/generationController';
import { generationService } from '../../services/generationService';
import { generationInputSchema, generationQuerySchema } from '../../validators/generationSchemas';
import { AppError } from '../../utils/appError';
import { ZodError } from 'zod';

jest.mock('../../services/generationService');
jest.mock('../../db', () => ({
  __esModule: true,
  default: {
    prepare: jest.fn(),
    exec: jest.fn(),
    pragma: jest.fn(),
  },
}));
jest.mock('fs');

const mockGenerationService = generationService as jest.Mocked<typeof generationService>;
const mockFs = fs as jest.Mocked<typeof fs>;

describe('generationController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {},
      query: {},
      userId: undefined,
      file: undefined,
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('createGeneration', () => {
    it('should create generation and return 201', async () => {
      const userId = 'user-123';
      const mockFile = {
        path: '/tmp/uploaded-image.png',
        originalname: 'image.png',
        mimetype: 'image/png',
        size: 1024,
        fieldname: 'image',
        encoding: '7bit',
        destination: '/tmp',
        filename: 'uploaded-image.png',
        buffer: Buffer.from('test'),
      };

      const mockBody = {
        prompt: 'Create a futuristic gown',
        style: 'Avant-garde' as const,
      };

      const mockResult = {
        id: 'gen-123',
        prompt: mockBody.prompt,
        style: mockBody.style,
        imageUrl: '/uploads/1234567890-image.png',
        createdAt: new Date().toISOString(),
        status: 'completed',
      };

      mockReq.userId = userId;
      mockReq.file = mockFile as Express.Multer.File;
      mockReq.body = mockBody;
      jest.spyOn(generationInputSchema, 'parse').mockReturnValue(mockBody);
      mockGenerationService.createGeneration.mockResolvedValue(mockResult);

      const handler = createGeneration as any;
      await handler(mockReq, mockRes, mockNext);

      expect(generationInputSchema.parse).toHaveBeenCalledWith(mockReq.body);
      expect(mockGenerationService.createGeneration).toHaveBeenCalledWith({
        userId,
        prompt: mockBody.prompt,
        style: mockBody.style,
        sourceFilePath: mockFile.path,
      });
      expect(mockFs.unlink).toHaveBeenCalledWith(mockFile.path, expect.any(Function));
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw AppError if userId is missing', async () => {
      mockReq.userId = undefined;
      mockReq.file = {
        path: '/tmp/image.png',
      } as Express.Multer.File;

      const handler = createGeneration as any;
      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = mockNext.mock.calls[0][0] as AppError;
      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(401);
      expect(mockGenerationService.createGeneration).not.toHaveBeenCalled();
    });

    it('should throw AppError if file is missing', async () => {
      mockReq.userId = 'user-123';
      mockReq.file = undefined;

      const handler = createGeneration as any;
      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = mockNext.mock.calls[0][0] as AppError;
      expect(error.message).toBe('Image upload is required');
      expect(error.statusCode).toBe(400);
      expect(mockGenerationService.createGeneration).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const validationError = new ZodError([
        {
          code: 'too_small',
          minimum: 3,
          inclusive: true,
          path: ['prompt'],
          message: 'String must contain at least 3 character(s)',
          fatal: false,
        } as any,
      ]);

      mockReq.userId = 'user-123';
      mockReq.file = { path: '/tmp/image.png' } as Express.Multer.File;
      mockReq.body = { prompt: 'ab', style: 'Minimalist' };
      jest.spyOn(generationInputSchema, 'parse').mockImplementation(() => {
        throw validationError;
      });

      const handler = createGeneration as any;
      await handler(mockReq, mockRes, mockNext);

      expect(generationInputSchema.parse).toHaveBeenCalledWith(mockReq.body);
      expect(mockGenerationService.createGeneration).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(validationError);
    });

    it('should handle service errors', async () => {
      const serviceError = new AppError('Model overloaded', 503);
      mockReq.userId = 'user-123';
      mockReq.file = { path: '/tmp/image.png' } as Express.Multer.File;
      mockReq.body = { prompt: 'Test prompt', style: 'Minimalist' };
      jest.spyOn(generationInputSchema, 'parse').mockReturnValue(mockReq.body);
      mockGenerationService.createGeneration.mockRejectedValue(serviceError);

      const handler = createGeneration as any;
      await handler(mockReq, mockRes, mockNext);
      await new Promise((resolve) => setImmediate(resolve));

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('listGenerations', () => {
    it('should list generations and return 200', async () => {
      const userId = 'user-123';
      const limit = 5;
      const mockItems = [
        {
          id: 'gen-1',
          prompt: 'Prompt 1',
          style: 'Minimalist',
          imageUrl: '/uploads/img1.png',
          createdAt: new Date().toISOString(),
          status: 'completed',
        },
      ];

      mockReq.userId = userId;
      mockReq.query = { limit: '5' };
      jest.spyOn(generationQuerySchema, 'parse').mockReturnValue({ limit });
      mockGenerationService.listGenerations.mockReturnValue(mockItems);

      const handler = listGenerations as any;
      await handler(mockReq, mockRes, mockNext);

      expect(generationQuerySchema.parse).toHaveBeenCalledWith(mockReq.query);
      expect(mockGenerationService.listGenerations).toHaveBeenCalledWith(userId, limit);
      expect(mockRes.json).toHaveBeenCalledWith({ items: mockItems });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw AppError if userId is missing', async () => {
      mockReq.userId = undefined;
      mockReq.query = { limit: '5' };

      const handler = listGenerations as any;
      await handler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = mockNext.mock.calls[0][0] as AppError;
      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(401);
      expect(mockGenerationService.listGenerations).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const validationError = new ZodError([
        {
          code: 'too_big',
          maximum: 20,
          inclusive: true,
          path: ['limit'],
          message: 'Number must be less than or equal to 20',
          fatal: false,
        } as any,
      ]);

      mockReq.userId = 'user-123';
      mockReq.query = { limit: '100' };
      jest.spyOn(generationQuerySchema, 'parse').mockImplementation(() => {
        throw validationError;
      });

      const handler = listGenerations as any;
      await handler(mockReq, mockRes, mockNext);

      expect(generationQuerySchema.parse).toHaveBeenCalledWith(mockReq.query);
      expect(mockGenerationService.listGenerations).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(validationError);
    });
  });
});

