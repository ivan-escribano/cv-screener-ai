// Actualizado
export enum ListState {
  Loading = "loading",
  Empty = "empty",
  List = "list",
  Error = "error",
}

export interface CvItem {
  fileId: string;
  chunks: number;
  createdAt: string;
}
