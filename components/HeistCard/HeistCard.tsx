"use client";

import Link from "next/link";
import { Clock, User, CalendarDays } from "lucide-react";
import { Heist } from "@/types/firestore";
import styles from "./HeistCard.module.css";

function formatDeadline(deadline: Date): {
  date: string;
  countdown: string;
  overdue: boolean;
} {
  const date = deadline.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const now = new Date();
  if (deadline <= now) {
    return { date, countdown: "Overdue", overdue: true };
  }

  const diffMs = deadline.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  let countdown: string;
  if (diffDays >= 1) {
    countdown = `${diffDays}d ${diffHours % 24}h`;
  } else {
    countdown = `${diffHours}h ${diffMins % 60}m`;
  }

  return { date, countdown, overdue: false };
}

interface HeistCardProps {
  heist: Heist;
}

export default function HeistCard({ heist }: HeistCardProps) {
  const { date, countdown, overdue } = formatDeadline(heist.deadline);

  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <Link href={`/heists/${heist.id}`} className={styles.title}>
          {heist.title}
        </Link>
        <Clock size={16} className={styles.clockIcon} />
      </div>
      <div className={styles.meta}>
        {heist.assignedToCodename && (
          <div className={styles.metaRow}>
            <User size={12} />
            <span>To:</span>
            <span className={styles.assignee}>@{heist.assignedToCodename}</span>
          </div>
        )}
        <div className={styles.metaRow}>
          <User size={12} />
          <span>By:</span>
          <span className={styles.creator}>@{heist.createdByCodename}</span>
        </div>
        <div className={styles.metaRow}>
          <CalendarDays size={12} />
          <span>{date}</span>
          <span>&bull;</span>
          <span className={overdue ? styles.overdue : styles.countdown}>
            {countdown}
          </span>
        </div>
      </div>
    </div>
  );
}
