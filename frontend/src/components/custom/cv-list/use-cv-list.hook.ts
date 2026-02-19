"use client";

// Actualizado
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { CvsApi } from "@/api/cvs/cvs.api";
import { CV_LIST_CONFIG } from "./CvList.config";
import { ListState } from "./CvList.interface";

import type { CvItem } from "./CvList.interface";

const { messages } = CV_LIST_CONFIG;

export const useCvList = (refreshKey?: number) => {
  const [state, setState] = useState<ListState>(ListState.Loading);
  const [cvs, setCvs] = useState<CvItem[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCVs = useCallback(async () => {
    setState(ListState.Loading);
    try {
      const response = await CvsApi.listCVs();

      setCvs(response.data.cvs);

      setState(
        response.data.cvs.length === 0 ? ListState.Empty : ListState.List,
      );
    } catch {
      setState(ListState.Error);
    }
  }, []);

  const deleteCV = useCallback(
    async (fileId: string) => {
      setDeletingId(fileId);

      try {
        await CvsApi.deleteCV(fileId);

        setCvs((prev) => prev.filter((cv) => cv.fileId !== fileId));

        setState((prev) =>
          prev === ListState.List && cvs.length === 1 ? ListState.Empty : prev,
        );

        toast.success(messages.deleteSuccess);
      } catch {
        toast.error(messages.deleteError);
      } finally {
        setDeletingId(null);
      }
    },
    [cvs.length],
  );

  useEffect(() => {
    fetchCVs();
  }, [fetchCVs, refreshKey]);

  return { state, cvs, deletingId, deleteCV };
};
