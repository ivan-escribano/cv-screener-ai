import { Request, Response } from 'express';

import { ERROR_CODES, SUCCESS_MESSAGES } from './cvs.config.js';
import { CvsService } from './cvs.service.js';

const uploadCV = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  if (!files?.length) {
    res.status(400).json({ success: false, message: ERROR_CODES.INVALID_PDF, data: null });
    return;
  }

  const results = await Promise.allSettled(files.map((file) => CvsService.uploadCV(file)));

  const data = results.map((result, index) => ({
    fileId: files[index].originalname,
    ...(result.status === 'fulfilled'
      ? { success: true, chunks: result.value.chunks }
      : { success: false, error: result.reason?.message ?? 'Unknown error' }),
  }));

  res.status(200).json({ success: true, message: SUCCESS_MESSAGES.CV_UPLOADED, data });
};

const listCVs = async (_: Request, res: Response) => {
  try {
    const data = await CvsService.listCVs();

    res.status(200).json({ success: true, message: SUCCESS_MESSAGES.CVS_LISTED, data });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    res.status(500).json({ success: false, message: errorMessage, data: null });
  }
};

const deleteCV = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    const data = await CvsService.deleteCV(fileId);

    res.status(200).json({ success: true, message: SUCCESS_MESSAGES.CV_DELETED, data });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    const status = errorMessage === ERROR_CODES.CV_NOT_FOUND ? 404 : 500;

    res.status(status).json({ success: false, message: errorMessage, data: null });
  }
};

export const CvsController = {
  uploadCV,
  listCVs,
  deleteCV,
};
