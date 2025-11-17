import fs from 'fs';
import path from 'path';
import { generationRepository } from '../repositories/generationRepository';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

export const generationService = {
  async createGeneration({
    userId,
    prompt,
    style,
    sourceFilePath,
  }: {
    userId: string;
    prompt: string;
    style: string;
    sourceFilePath: string;
  }) {
    await simulateDelay();

    if (Math.random() < 0.2) {
      throw new AppError('Model overloaded', 503);
    }

    const filename = `${Date.now()}-${path.basename(sourceFilePath)}`;
    const targetPath = path.join(env.uploadsDir, filename);
    fs.copyFileSync(sourceFilePath, targetPath);

    const record = generationRepository.create({
      user_id: userId,
      prompt,
      style,
      image_url: `/uploads/${filename}`,
      status: 'completed',
    });

    return toResponse(record);
  },

  listGenerations(userId: string, limit: number) {
    const records = generationRepository.listByUser(userId, limit);
    return records.map(toResponse);
  },
};

const simulateDelay = () =>
  new Promise((resolve) => {
    const delay = 1000 + Math.floor(Math.random() * 1000);
    setTimeout(resolve, delay);
  });

const toResponse = (record: {
  id: string;
  prompt: string;
  style: string;
  image_url: string;
  created_at: string;
  status: string;
}) => ({
  id: record.id,
  prompt: record.prompt,
  style: record.style,
  imageUrl: record.image_url,
  createdAt: record.created_at,
  status: record.status,
});
