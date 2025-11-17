import { Request, Response } from 'express';
import fs from 'fs';
import { asyncHandler } from '../utils/asyncHandler';
import { generationInputSchema, generationQuerySchema } from '../validators/generationSchemas';
import { generationService } from '../services/generationService';
import { AppError } from '../utils/appError';

export const createGeneration = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  if (!req.file) {
    throw new AppError('Image upload is required', 400);
  }

  const body = generationInputSchema.parse(req.body);

  const result = await generationService.createGeneration({
    userId,
    prompt: body.prompt,
    style: body.style,
    sourceFilePath: req.file.path,
  });

  // Clean up original upload after copy
  fs.unlink(req.file.path, () => {});

  res.status(201).json(result);
});

export const listGenerations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  const { limit } = generationQuerySchema.parse(req.query);
  const items = await Promise.resolve(generationService.listGenerations(userId, limit));
  res.json({ items });
});
