"use client";

import { useState } from "react";

import CvList from "@/components/custom/cv-list/CvList.component";
import CvUploaderDialog from "@/components/custom/cv-uploader/sub-components/cv-uploader-dialog/CvUploaderDialog.component";
import styles from "./Cvs.module.css";

export default function CvsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Uploaded Candidates</h1>

        <CvUploaderDialog onSuccess={() => setRefreshKey((k) => k + 1)} />
      </div>

      <CvList
        refreshKey={refreshKey}
        onDeleted={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
