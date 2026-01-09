import { Router } from 'express';

import { IngestController } from './ingest.controller.js';

const router = Router();

router.post('/', IngestController.ingestPDFs);

export default router;
