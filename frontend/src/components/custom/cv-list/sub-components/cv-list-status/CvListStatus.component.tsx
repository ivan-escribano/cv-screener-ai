// Creado
import { CV_LIST_CONFIG } from "../../CvList.config";
import { ListState } from "../../CvList.interface";
import styles from "../../CvList.module.css";

import type { CvListStatusProps } from "./CvListStatus.interface";

const { messages } = CV_LIST_CONFIG;

const CvListStatus = ({ state }: CvListStatusProps) => {
  if (state === ListState.Loading) return null;

  if (state === ListState.Error)
    return <p className={styles.empty}>{messages.error}</p>;

  if (state === ListState.Empty) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>{messages.empty}</p>
        <p className={styles.emptySubtext}>{messages.emptySubtext}</p>
      </div>
    );
  }

  return null;
};

export default CvListStatus;
