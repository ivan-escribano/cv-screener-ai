import type { UploadResponse } from "@/components/custom/cv-uploader/CvUploader.interface";
import type { CvListResponse, DeleteCvResponse } from "./cvs.dto";

import { api } from "../shared/api.config";
import { CVS_BASE_URL } from "./cvs.config";

const listCVs = async (): Promise<CvListResponse> => {
  const response = await api.get<CvListResponse>(CVS_BASE_URL);

  return response.data;
};

const uploadCVs = async (files: File[]): Promise<UploadResponse> => {
  const formData = new FormData();

  files.forEach((file) => formData.append("cvs", file));

  const response = await api.post<UploadResponse>(
    `${CVS_BASE_URL}/upload`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return response.data;
};

const deleteCV = async (fileId: string): Promise<DeleteCvResponse> => {
  const response = await api.delete<DeleteCvResponse>(
    `${CVS_BASE_URL}/${fileId}`,
  );

  return response.data;
};

export const CvsApi = {
  listCVs,
  uploadCVs,
  deleteCV,
};
