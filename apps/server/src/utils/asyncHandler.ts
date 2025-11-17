import { Request, Response, NextFunction } from 'express';

export const asyncHandler =
  <TRequest extends Request = Request, TResponse extends Response = Response>(
    handler: (req: TRequest, res: TResponse, next: NextFunction) => Promise<unknown>,
  ) =>
  (req: TRequest, res: TResponse, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
