import Link from "next/link";
import { Clock8, Target, Lock, Zap, CheckCircle2 } from "lucide-react";
import styles from "./page.module.css";

const features = [
  { icon: Target, label: "Assign covert tasks" },
  { icon: Lock, label: "Track in secret" },
  { icon: Zap, label: "Cause just enough chaos" },
  { icon: CheckCircle2, label: "Get things done" },
];

export default function Home() {
  return (
    <div className={styles.hero}>
      {/* Atmospheric background glows */}
      <div className={`${styles.glow} ${styles.glowPrimary}`} />
      <div className={`${styles.glow} ${styles.glowSecondary}`} />

      {/* SVG gradient for the logo icon stroke */}
      <svg
        width="0"
        height="0"
        style={{ position: "absolute" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C27AFF" />
            <stop offset="100%" stopColor="#FB64B6" />
          </linearGradient>
        </defs>
      </svg>

      <div className={`page-content ${styles.content}`}>
        {/* Mission badge */}
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          Covert Task Management
        </div>

        {/* Heading */}
        <h1 className={styles.heading}>
          P<Clock8 className="logo" strokeWidth={2.75} />
          cket Heist
        </h1>

        {/* Tagline */}
        <p className={styles.tagline}>Steal the day. One task at a time.</p>

        {/* Description */}
        <p className={styles.description}>
          Assign covert tasks to your colleagues, track progress in secret, and
          cause just enough chaos to make the workday interesting.
        </p>

        {/* CTA buttons */}
        <div className={styles.cta}>
          <Link href="/signup" className="btn">
            Register — it&apos;s free
          </Link>
          <Link href="/login" className={styles.btnSecondary}>
            Login
          </Link>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Feature cards */}
        <div className={styles.features}>
          {features.map(({ icon: Icon, label }) => (
            <div key={label} className={styles.featureCard}>
              <Icon size={16} className={styles.featureIcon} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
