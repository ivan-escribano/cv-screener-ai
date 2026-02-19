"use client";

import { useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";

import { CV_UPLOADER_CONFIG } from "./CvUploader.config";
import { UploadState } from "./CvUploader.interface";
import styles from "./CvUploader.module.css";
import { useCvUploader } from "./use-cv-uploader.hook";

interface CvUploaderProps {
  onSuccess?: () => void;
}

const CvUploader = ({ onSuccess }: CvUploaderProps = {}) => {
  const { state, results, upload, reset } = useCvUploader();
  const { messages, accept, maxSize } = CV_UPLOADER_CONFIG;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxSize,
    disabled: state === UploadState.Uploading,
    onDropAccepted: upload,
  });

  const dropzoneClass = [
    styles.dropzone,
    isDragActive ? styles.dropzoneActive : "",
    state === UploadState.Uploading ? styles.dropzoneUploading : "",
  ]
    .filter(Boolean)
    .join(" ");

  const hasNotified = useRef(false);

  useEffect(() => {
    if (state === UploadState.Success && !hasNotified.current) {
      hasNotified.current = true;
      onSuccess?.();
    }
    if (state === UploadState.Idle) {
      hasNotified.current = false;
    }
  }, [state, onSuccess]);

  return (
    <div className={styles.container}>
      <div {...getRootProps({ className: dropzoneClass })}>
        <input {...getInputProps()} />

        {state === UploadState.Idle && (
          <>
            <p className={styles.title}>
              {isDragActive ? messages.dragover : messages.idle}
            </p>
            {!isDragActive && (
              <p className={styles.subtext}>{messages.idleSubtext}</p>
            )}
            <p className={styles.hint}>{messages.hint}</p>
          </>
        )}

        {state === UploadState.Uploading && (
          <p className={styles.title}>{messages.uploading}</p>
        )}

        {state === UploadState.Success && (
          <p className={styles.title}>{messages.success}</p>
        )}

        {state === UploadState.Error && (
          <p className={styles.title}>{messages.error}</p>
        )}
      </div>

      {results.length > 0 && (
        <div className={styles.resultsList}>
          {results.map((result) => (
            <div
              key={result.fileId}
              className={`${styles.resultItem} ${result.success ? styles.resultSuccess : styles.resultError}`}
            >
              <span>{result.fileId}</span>
              <span>
                {result.success
                  ? `${result.chunks} chunks`
                  : (messages.errorCodes[result.error ?? ""] ?? result.error)}
              </span>
            </div>
          ))}
        </div>
      )}

      {(state === UploadState.Success || state === UploadState.Error) && (
        <button className={styles.resetButton} onClick={reset}>
          {messages.resetButton}
        </button>
      )}
    </div>
  );
};

export default CvUploader;
