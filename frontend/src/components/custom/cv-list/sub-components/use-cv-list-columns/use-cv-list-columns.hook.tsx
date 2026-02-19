// Creado
import { ArrowUpDown, FileText } from "lucide-react";
import { useMemo } from "react";

import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import DeleteCvDialog from "../delete-cv-dialog/DeleteCvDialog.component";

import type { ColumnDef } from "@tanstack/react-table";
import type { CvItem } from "../../CvList.interface";

import styles from "../../CvList.module.css";

interface UseCvListColumnsParams {
  deletingId: string | null;
  onDelete: (fileId: string) => void;
}

const useCvListColumns = ({
  deletingId,
  onDelete,
}: UseCvListColumnsParams): ColumnDef<CvItem>[] => {
  const columns = useMemo<ColumnDef<CvItem>[]>(
    () => [
      {
        accessorKey: "fileId",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            File <ArrowUpDown size={14} className="ml-1" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className={styles.fileCell}>
            <FileText size={14} className={styles.fileIcon} />
            {row.original.fileId}
          </span>
        ),
      },
      {
        accessorKey: "chunks",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Sections <ArrowUpDown size={14} className="ml-1" />
          </Button>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date <ArrowUpDown size={14} className="ml-1" />
          </Button>
        ),
        cell: ({ row }) =>
          formatDistanceToNow(new Date(row.original.createdAt), {
            addSuffix: true,
          }),
        sortingFn: "datetime",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DeleteCvDialog
            fileId={row.original.fileId}
            isDeleting={deletingId === row.original.fileId}
            onConfirm={onDelete}
          />
        ),
      },
    ],
    [deletingId, onDelete],
  );

  return columns;
};

export default useCvListColumns;
