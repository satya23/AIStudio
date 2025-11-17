import fs from 'fs';
import path from 'path';
import { generationService } from '../../services/generationService';
import { generationRepository } from '../../repositories/generationRepository';
import { AppError } from '../../utils/appError';
import { env } from '../../config/env';

jest.mock('../../repositories/generationRepository');
jest.mock('../../db', () => ({
  __esModule: true,
  default: {
    prepare: jest.fn(),
    exec: jest.fn(),
    pragma: jest.fn(),
  },
}));
jest.mock('fs');
jest.mock('../../config/env', () => ({
  env: {
    uploadsDir: '/test/uploads',
    dbPath: '/test/test.db',
  },
}));

const mockGenerationRepository = generationRepository as jest.Mocked<typeof generationRepository>;
const mockFs = fs as jest.Mocked<typeof fs>;

describe('generationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('createGeneration', () => {
    const mockInput = {
      userId: 'user-123',
      prompt: 'Create a futuristic gown',
      style: 'Avant-garde',
      sourceFilePath: '/tmp/test-image.png',
    };

    it('should create a generation successfully', async () => {
      const mockRecord = {
        id: 'gen-123',
        user_id: mockInput.userId,
        prompt: mockInput.prompt,
        style: mockInput.style,
        image_url: '/uploads/1234567890-test-image.png',
        created_at: new Date().toISOString(),
        status: 'completed',
      };

      jest.spyOn(Math, 'random').mockReturnValue(0.5);
      jest.spyOn(Date, 'now').mockReturnValue(1234567890);
      mockGenerationRepository.create.mockReturnValue(mockRecord);

      const promise = generationService.createGeneration(mockInput);
      jest.advanceTimersByTime(1500);
      const result = await promise;

      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        mockInput.sourceFilePath,
        path.join(env.uploadsDir, '1234567890-test-image.png'),
      );
      expect(mockGenerationRepository.create).toHaveBeenCalledWith({
        user_id: mockInput.userId,
        prompt: mockInput.prompt,
        style: mockInput.style,
        image_url: '/uploads/1234567890-test-image.png',
        status: 'completed',
      });
      expect(result).toEqual({
        id: mockRecord.id,
        prompt: mockRecord.prompt,
        style: mockRecord.style,
        imageUrl: mockRecord.image_url,
        createdAt: mockRecord.created_at,
        status: mockRecord.status,
      });

      (Math.random as jest.MockedFunction<typeof Math.random>).mockRestore();
      (Date.now as jest.MockedFunction<typeof Date.now>).mockRestore();
    });

    it('should throw AppError when model is overloaded', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.1); // < 0.2

      const promise = generationService.createGeneration(mockInput);
      jest.advanceTimersByTime(1500);

      await expect(promise).rejects.toThrow(AppError);
      await expect(promise).rejects.toThrow('Model overloaded');

      expect(mockFs.copyFileSync).not.toHaveBeenCalled();
      expect(mockGenerationRepository.create).not.toHaveBeenCalled();

      (Math.random as jest.MockedFunction<typeof Math.random>).mockRestore();
    });

    it('should handle file path with spaces correctly', async () => {
      const inputWithSpaces = {
        ...mockInput,
        sourceFilePath: '/tmp/test image.png',
      };

      const mockRecord = {
        id: 'gen-123',
        user_id: inputWithSpaces.userId,
        prompt: inputWithSpaces.prompt,
        style: inputWithSpaces.style,
        image_url: '/uploads/1234567890-test_image.png',
        created_at: new Date().toISOString(),
        status: 'completed',
      };

      jest.spyOn(Math, 'random').mockReturnValue(0.5);
      jest.spyOn(Date, 'now').mockReturnValue(1234567890);
      jest.spyOn(path, 'basename').mockReturnValue('test image.png');
      mockGenerationRepository.create.mockReturnValue(mockRecord);

      const promise = generationService.createGeneration(inputWithSpaces);
      jest.advanceTimersByTime(1500);
      await promise;

      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        inputWithSpaces.sourceFilePath,
        path.join(env.uploadsDir, '1234567890-test image.png'),
      );

      (Math.random as jest.MockedFunction<typeof Math.random>).mockRestore();
      (Date.now as jest.MockedFunction<typeof Date.now>).mockRestore();
      (path.basename as jest.MockedFunction<typeof path.basename>).mockRestore();
    });
  });

  describe('listGenerations', () => {
    it('should return formatted generation list', () => {
      const userId = 'user-123';
      const limit = 5;

      const mockRecords = [
        {
          id: 'gen-1',
          user_id: userId,
          prompt: 'Prompt 1',
          style: 'Minimalist',
          image_url: '/uploads/img1.png',
          created_at: '2024-01-01T00:00:00Z',
          status: 'completed',
        },
        {
          id: 'gen-2',
          user_id: userId,
          prompt: 'Prompt 2',
          style: 'Formal',
          image_url: '/uploads/img2.png',
          created_at: '2024-01-02T00:00:00Z',
          status: 'completed',
        },
      ];

      mockGenerationRepository.listByUser.mockReturnValue(mockRecords);

      const result = generationService.listGenerations(userId, limit);

      expect(mockGenerationRepository.listByUser).toHaveBeenCalledWith(userId, limit);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: mockRecords[0].id,
        prompt: mockRecords[0].prompt,
        style: mockRecords[0].style,
        imageUrl: mockRecords[0].image_url,
        createdAt: mockRecords[0].created_at,
        status: mockRecords[0].status,
      });
      expect(result[1]).toEqual({
        id: mockRecords[1].id,
        prompt: mockRecords[1].prompt,
        style: mockRecords[1].style,
        imageUrl: mockRecords[1].image_url,
        createdAt: mockRecords[1].created_at,
        status: mockRecords[1].status,
      });
    });

    it('should return empty array when no generations exist', () => {
      const userId = 'user-123';
      const limit = 5;

      mockGenerationRepository.listByUser.mockReturnValue([]);

      const result = generationService.listGenerations(userId, limit);

      expect(mockGenerationRepository.listByUser).toHaveBeenCalledWith(userId, limit);
      expect(result).toEqual([]);
    });
  });
});

