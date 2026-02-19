import type { CvItem } from "@/components/custom/cv-list/CvList.interface";

export interface CvListResponse {
  success: boolean;
  message: string;
  data: { cvs: CvItem[]; total: number };
}

export interface DeleteCvResponse {
  success: boolean;
  message: string;
  data: { fileId: string; deletedChunks: number };
}
