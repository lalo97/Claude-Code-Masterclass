"use client";

import { signOut } from "firebase/auth";
import { Clock8, Plus } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { auth } from "@/lib/firebase";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, loading } = useUser();

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  }

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
          {!loading && user && (
            <li>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </li>
          )}
          <li>
            <Link href="/heists/create" className={styles.createBtn}>
              <Plus size={20} strokeWidth={2} />
              Create New Heist
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
