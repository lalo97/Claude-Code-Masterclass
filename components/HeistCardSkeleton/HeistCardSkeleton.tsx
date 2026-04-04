import styles from "./HeistCardSkeleton.module.css";

export default function HeistCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <div className={`${styles.line} ${styles.lineLong}`} />
        <div className={styles.iconCircle} />
      </div>
      <div className={styles.meta}>
        <div className={styles.metaRow}>
          <div className={styles.iconSquare} />
          <div className={`${styles.line} ${styles.lineShort}`} />
        </div>
        <div className={styles.metaRow}>
          <div className={styles.iconSquare} />
          <div className={`${styles.line} ${styles.lineShort}`} />
        </div>
        <div className={styles.metaRow}>
          <div className={styles.iconSquare} />
          <div className={`${styles.line} ${styles.lineMedium}`} />
        </div>
      </div>
    </div>
  );
}
