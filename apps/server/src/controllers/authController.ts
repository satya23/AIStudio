import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { signupSchema, loginSchema } from '../validators/authSchemas';
import { authService } from '../services/authService';

export const signup = asyncHandler(async (req, res: Response) => {
  const { email, password } = signupSchema.parse(req.body);
  const result = await authService.signup(email, password);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  const result = await authService.login(email, password);
  res.status(200).json(result);
});
