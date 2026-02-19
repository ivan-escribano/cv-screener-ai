"use client";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListState } from "./CvList.interface";
import styles from "./CvList.module.css";
import CvListStatus from "./sub-components/cv-list-status/CvListStatus.component";
import useCvListColumns from "./sub-components/use-cv-list-columns/use-cv-list-columns.hook";
import { useCvList } from "./use-cv-list.hook";

import type { SortingState } from "@tanstack/react-table";

// Actualizado
interface CvListProps {
  onDeleted?: () => void;
  refreshKey?: number;
}

const CvList = ({ onDeleted, refreshKey }: CvListProps) => {
  const { state, cvs, deletingId, deleteCV } = useCvList(refreshKey);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const handleDelete = async (fileId: string) => {
    await deleteCV(fileId);
    onDeleted?.();
  };

  const columns = useCvListColumns({ deletingId, onDelete: handleDelete });

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: cvs,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (state !== ListState.List) return <CvListStatus state={state} />;

  return (
    <div className={styles.tableWrapper}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <p className={styles.footer}>
        {cvs.length} {cvs.length === 1 ? "candidate" : "candidates"}
      </p>
    </div>
  );
};

export default CvList;
