"use client";

// Actualizado
import { FileText, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { CvsApi } from "@/api/cvs/cvs.api";
import { ROUTES } from "@/config/routes.config";

import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const pathname = usePathname();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    CvsApi.listCVs()
      .then((res) => setCount(res.data.total))
      .catch(() => setCount(null));
  }, [pathname]);

  return (
    <aside className={styles.sidebar}>
      <span className={styles.logo}>CV Screener AI</span>

      <nav className={styles.nav}>
        <Link
          href={ROUTES.cvs}
          className={`${styles.link} ${pathname === ROUTES.cvs ? styles.active : ""}`}
        >
          <FileText size={18} />
          CVs
          {count !== null && <span className={styles.badge}>{count}</span>}
        </Link>

        <Link
          href={ROUTES.chat}
          className={`${styles.link} ${pathname === ROUTES.chat ? styles.active : ""}`}
        >
          <MessageSquare size={18} />
          Chat
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
