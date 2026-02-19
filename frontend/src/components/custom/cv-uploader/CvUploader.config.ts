// Actualizado
export const CV_UPLOADER_CONFIG = {
  maxSize: 5 * 1024 * 1024,
  accept: { "application/pdf": [".pdf"] },
  messages: {
    idle: "Drop your CVs here",
    idleSubtext: "or click to select files",
    hint: "PDF only · Max 5MB per file",
    dragover: "Drop files here",
    uploading: "Uploading...",
    success: "Upload complete",
    error: "Something went wrong",
    resetButton: "Upload more CVs",
    errorCodes: {
      INVALID_PDF: "File is not a valid PDF",
      FILE_TOO_LARGE: "File exceeds 5MB limit",
      DUPLICATE_FILE: "This CV is already in the system",
      NO_TEXT_EXTRACTED: "Could not extract text from PDF",
    } as Record<string, string>,
  },
};
