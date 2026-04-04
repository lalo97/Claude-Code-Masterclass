"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/context/UserContext";
import { COLLECTIONS, Heist, heistConverter } from "@/types/firestore";

type HeistMode = "active" | "assigned" | "expired";

export function useHeists(mode: HeistMode): {
  heists: Heist[];
  loading: boolean;
} {
  const { user, loading: userLoading } = useUser();
  const [heists, setHeists] = useState<Heist[]>([]);
  const [snapshotReceived, setSnapshotReceived] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const now = Timestamp.now();
    const heistsRef = collection(db, COLLECTIONS.HEISTS).withConverter(
      heistConverter,
    );

    const q =
      mode === "active"
        ? query(
            heistsRef,
            where("assignedTo", "==", user.uid),
            where("deadline", ">", now),
          )
        : mode === "assigned"
          ? query(
              heistsRef,
              where("createdBy", "==", user.uid),
              where("deadline", ">", now),
            )
          : query(
              heistsRef,
              where("deadline", "<=", now),
              where("finalStatus", "!=", null),
            );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHeists(snapshot.docs.map((doc) => doc.data() as Heist));
      setSnapshotReceived(true);
    });

    return unsubscribe;
  }, [mode, user]);

  return { heists, loading: userLoading || (!!user && !snapshotReceived) };
}
