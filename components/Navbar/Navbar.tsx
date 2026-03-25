"use client";

import { Clock8, Plus } from "lucide-react";
import Link from "next/link";
import styles from "./Navbar.module.css";
import { useUser } from "@/context/UserContext";
import Avatar from "@/components/Avatar";

export default function Navbar() {
  const { user, loading } = useUser();

  return (
    <div className={styles.siteNav}>
      <nav>
        <header>
          <h1>
            <Link href="/heists">
              P<Clock8 className={styles.logo} size={14} strokeWidth={2.75} />
              cket Heist
            </Link>
          </h1>
          <div>Tiny missions. Big office mischief.</div>
        </header>
        <ul>
          <li>
            <Link href="/heists/create" className={styles.createBtn}>
              <Plus size={20} strokeWidth={2} />
              Create New Heist
            </Link>
          </li>
        </ul>
        {loading ? (
          <div className={styles.avatarSkeleton} />
        ) : user ? (
          <Avatar name={user.displayName ?? user.email ?? "User"} />
        ) : null}
      </nav>
    </div>
  );
}
