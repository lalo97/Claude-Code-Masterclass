# Plan: useHeists Hook

## Context

The heists dashboard page needs real-time Firestore data. The spec asks for a `useHeists(mode)` custom hook that sets up a typed `onSnapshot` listener filtered per mode, returning a `Heist[]` and `loading` boolean. Once the hook exists, the dashboard page wires it up three times to display heist titles per section.

---

## Files to create / modify

| Action | Path |
|--------|------|
| Create | `hooks/useHeists/useHeists.ts` |
| Create | `hooks/useHeists/index.ts` |
| Create | `tests/hooks/useHeists.test.tsx` |
| Modify | `app/(dashboard)/heists/page.tsx` |

---

## Existing utilities to reuse

- `useUser()` — `context/UserContext.tsx` — provides `{ user, loading }`
- `db` — `lib/firebase.ts` — Firestore instance
- `Heist`, `heistConverter` — `types/firestore/heist.ts`
- `COLLECTIONS.HEISTS` — `types/firestore/index.ts`

---

## Implementation

### 1. `hooks/useHeists/useHeists.ts`

```ts
"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, Timestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/context/UserContext";
import { COLLECTIONS, Heist, heistConverter } from "@/types/firestore";

type HeistMode = "active" | "assigned" | "expired";

export function useHeists(mode: HeistMode): { heists: Heist[]; loading: boolean } {
  const { user } = useUser();
  const [heists, setHeists] = useState<Heist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHeists([]);
      setLoading(false);
      return;
    }

    const now = Timestamp.now();
    const heistsRef = collection(db, COLLECTIONS.HEISTS).withConverter(heistConverter);

    const q =
      mode === "active"
        ? query(heistsRef, where("assignedTo", "==", user.uid), where("deadline", ">", now))
        : mode === "assigned"
          ? query(heistsRef, where("createdBy", "==", user.uid), where("deadline", ">", now))
          : query(heistsRef, where("deadline", "<=", now), where("finalStatus", "!=", null));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHeists(snapshot.docs.map((doc) => doc.data()));
      setLoading(false);
    });

    return unsubscribe;
  }, [mode, user]);

  return { heists, loading };
}
```

### 2. `hooks/useHeists/index.ts`

```ts
export { useHeists } from "./useHeists";
```

### 3. `app/(dashboard)/heists/page.tsx`

Add `"use client"` directive. Call `useHeists` for each of the three modes and render `title` under each heading. The draft section has no hook — leave it as-is.

```tsx
"use client";

import { useHeists } from "@/hooks/useHeists";

export default function HeistsPage() {
  const { heists: activeHeists } = useHeists("active");
  const { heists: assignedHeists } = useHeists("assigned");
  const { heists: expiredHeists } = useHeists("expired");

  return (
    <div className="page-content">
      <div className="draft-heists">
        <h2>Your Draft Heists</h2>
      </div>
      <div className="active-heists">
        <h2>Your Active Heists</h2>
        {activeHeists.map((h) => <p key={h.id}>{h.title}</p>)}
      </div>
      <div className="assigned-heists">
        <h2>Heists You've Assigned</h2>
        {assignedHeists.map((h) => <p key={h.id}>{h.title}</p>)}
      </div>
      <div className="expired-heists">
        <h2>All Expired Heists</h2>
        {expiredHeists.map((h) => <p key={h.id}>{h.title}</p>)}
      </div>
    </div>
  );
}
```

---

## Test file: `tests/hooks/useHeists.test.tsx`

Mock strategy mirrors `UserContext.test.tsx` — capture the `onSnapshot` callback via `vi.fn()` and fire it with `act()`.

Key mocks:
- `@/lib/firebase` → `{ db: {} }`
- `@/context/UserContext` → mock `useUser`
- `firebase/firestore` → mock `collection` (with `.withConverter()`), `query`, `where`, `Timestamp.now`, and `onSnapshot` (captures callback, returns `mockUnsubscribe`)

Test cases:
1. Returns `{ heists: [], loading: false }` when `user` is null (no query attempted)
2. Returns `{ heists: [], loading: false }` when snapshot has no docs
3. Returns correctly shaped `Heist[]` for `active` mode (mocked snapshot docs)
4. Returns correctly shaped `Heist[]` for `assigned` mode
5. Returns correctly shaped `Heist[]` for `expired` mode
6. Calls `unsubscribe` when hook unmounts
7. Re-subscribes (new `onSnapshot` call) when `mode` changes

---

## Verification

```bash
npx vitest run tests/hooks/useHeists.test.tsx
npm run lint
npm run build
```

Manually: start dev server, log in, visit `/heists` — three sections should render heist titles live.
