// Creado
import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CV_LIST_CONFIG } from "../../CvList.config";

import type { DeleteCvDialogProps } from "./DeleteCvDialog.interface";

const { messages } = CV_LIST_CONFIG;

const DeleteCvDialog = ({ fileId, isDeleting, onConfirm }: DeleteCvDialogProps) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="ghost" size="icon" disabled={isDeleting} className="cursor-pointer">
        {isDeleting ? "..." : <Trash2 size={15} />}
      </Button>
    </AlertDialogTrigger>

    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{messages.deleteConfirmTitle}</AlertDialogTitle>
        <AlertDialogDescription>
          {messages.deleteConfirmDescription}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel>{messages.cancelButton}</AlertDialogCancel>
        <AlertDialogAction
          onClick={() => onConfirm(fileId)}
          className="bg-red-600 hover:bg-red-700"
        >
          {messages.deleteConfirmButton}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default DeleteCvDialog;
