"use client";

// Actualizado
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { CvsApi } from "@/api/cvs/cvs.api";
import { CV_UPLOADER_CONFIG } from "./CvUploader.config";
import { UploadState } from "./CvUploader.interface";

import type { UploadFileResult } from "./CvUploader.interface";

const { messages } = CV_UPLOADER_CONFIG;

export const useCvUploader = () => {
  const [state, setState] = useState<UploadState>(UploadState.Idle);
  const [results, setResults] = useState<UploadFileResult[]>([]);

  const upload = useCallback(async (files: File[]) => {
    setState(UploadState.Uploading);

    setResults([]);

    try {
      const response = await CvsApi.uploadCVs(files);

      setResults(response.data);

      setState(UploadState.Success);

      response.data.forEach((result) => {
        if (result.success) {
          toast.success(`${result.fileId} uploaded`);
        } else {
          toast.error(
            messages.errorCodes[result.error ?? ""] ?? result.error ?? messages.error,
          );
        }
      });
    } catch {
      setState(UploadState.Error);
      toast.error(messages.error);
    }
  }, []);

  const reset = useCallback(() => {
    setState(UploadState.Idle);
    setResults([]);
  }, []);

  return { state, results, upload, reset };
};
