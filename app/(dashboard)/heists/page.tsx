"use client";

import { Clock, Target, Archive, User, CalendarDays } from "lucide-react";
import { useHeists } from "@/hooks/useHeists";
import HeistCard from "@/components/HeistCard";
import HeistCardSkeleton from "@/components/HeistCardSkeleton";
import { Heist } from "@/types/firestore";
import styles from "./page.module.css";

function SectionHeader({
  icon,
  title,
  iconClass,
}: {
  icon: React.ReactNode;
  title: string;
  iconClass?: string;
}) {
  return (
    <div className={styles.sectionHeader}>
      <div className={`${styles.iconCircle} ${iconClass ?? ""}`}>{icon}</div>
      <h2 className={styles.sectionTitle}>{title}</h2>
    </div>
  );
}

function HistoryRow({ heist }: { heist: Heist }) {
  const date = heist.deadline.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const badgeClass =
    heist.finalStatus === "success" ? styles.badgeSuccess : styles.badgeFailure;
  const badgeLabel = heist.finalStatus === "success" ? "SUCCESS" : "FAILED";

  return (
    <div className={styles.historyRow}>
      <div className={styles.historyRowTop}>
        <span className={styles.historyTitle}>{heist.title}</span>
        <span className={styles.historyDate}>
          <CalendarDays size={14} />
          {date}
        </span>
        {heist.finalStatus && (
          <span className={`${styles.historyBadge} ${badgeClass}`}>
            {badgeLabel}
          </span>
        )}
      </div>
      <div className={styles.historyRowBottom}>
        {heist.assignedToCodename && (
          <span className={styles.historyMeta}>
            <User size={12} />
            <span>To:</span>
            <span className={styles.historyAssignee}>
              @{heist.assignedToCodename}
            </span>
          </span>
        )}
        <span className={styles.historyMeta}>
          <User size={12} />
          <span>By:</span>
          <span className={styles.historyCreator}>
            @{heist.createdByCodename}
          </span>
        </span>
      </div>
    </div>
  );
}

export default function HeistsPage() {
  const { heists: activeHeists, loading: activeLoading } = useHeists("active");
  const { heists: assignedHeists, loading: assignedLoading } =
    useHeists("assigned");
  const { heists: expiredHeists, loading: expiredLoading } =
    useHeists("expired");

  return (
    <div className="page-content">
      {/* Active Heists */}
      <section className={styles.section}>
        <SectionHeader
          icon={<Clock size={16} className="text-primary" />}
          title="Active Heists"
        />
        {activeLoading ? (
          <div className={styles.grid}>
            <HeistCardSkeleton />
            <HeistCardSkeleton />
          </div>
        ) : activeHeists.length === 0 ? (
          <p className={styles.empty}>No active heists.</p>
        ) : (
          <div className={styles.grid}>
            {activeHeists.map((h) => (
              <HeistCard key={h.id} heist={h} />
            ))}
          </div>
        )}
      </section>

      {/* Assigned Heists */}
      <section className={styles.section}>
        <SectionHeader
          icon={<Target size={16} className="text-secondary" />}
          title="Assigned Heists"
        />
        {assignedLoading ? (
          <div className={styles.grid}>
            <HeistCardSkeleton />
            <HeistCardSkeleton />
          </div>
        ) : assignedHeists.length === 0 ? (
          <p className={styles.empty}>No assigned heists.</p>
        ) : (
          <div className={styles.grid}>
            {assignedHeists.map((h) => (
              <HeistCard key={h.id} heist={h} />
            ))}
          </div>
        )}
      </section>

      {/* Heist History */}
      <section className={styles.section}>
        <SectionHeader
          icon={<Archive size={16} className="text-body" />}
          title="Heist History"
        />
        {!expiredLoading && expiredHeists.length === 0 ? (
          <p className={styles.empty}>No heist history.</p>
        ) : (
          <div className={styles.historyList}>
            {expiredHeists.map((h) => (
              <HistoryRow key={h.id} heist={h} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
