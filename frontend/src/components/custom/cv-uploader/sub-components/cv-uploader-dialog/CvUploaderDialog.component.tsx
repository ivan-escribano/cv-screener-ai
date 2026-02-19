"use client";

// Actualizado
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CvUploader from "../../CvUploader.component";

import type { CvUploaderDialogProps } from "./CvUploaderDialog.interface";

const CvUploaderDialog = ({ onSuccess }: CvUploaderDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">+ Upload CVs</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload CVs</DialogTitle>
        </DialogHeader>

        <CvUploader onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default CvUploaderDialog;
