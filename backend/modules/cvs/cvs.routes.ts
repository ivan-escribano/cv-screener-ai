// Creado
import { Router } from 'express';
import multer from 'multer';

import { CvsController } from './cvs.controller.js';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', CvsController.listCVs); // Actualizado
router.post('/upload', upload.array('cvs'), CvsController.uploadCV);
router.delete('/:fileId', CvsController.deleteCV); // Actualizado

export default router;
