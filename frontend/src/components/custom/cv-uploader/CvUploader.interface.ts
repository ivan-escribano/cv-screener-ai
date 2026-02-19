// Actualizado
export enum UploadState {
  Idle = "idle",
  Uploading = "uploading",
  Success = "success",
  Error = "error",
}

export interface UploadFileResult {
  fileId: string;
  success: boolean;
  chunks?: number;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data: UploadFileResult[];
}