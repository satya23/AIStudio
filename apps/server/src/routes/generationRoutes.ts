import { Router } from 'express';
import { createGeneration, listGenerations } from '../controllers/generationController';
import { authMiddleware } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

router.use(authMiddleware);
router.post('/', upload.single('image'), createGeneration);
router.get('/', listGenerations);

export default router;
