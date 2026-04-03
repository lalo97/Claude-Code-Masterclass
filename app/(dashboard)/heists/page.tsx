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
        {activeHeists.map((h) => (
          <p key={h.id}>{h.title}</p>
        ))}
      </div>
      <div className="assigned-heists">
        <h2>Heists You&apos;ve Assigned</h2>
        {assignedHeists.map((h) => (
          <p key={h.id}>{h.title}</p>
        ))}
      </div>
      <div className="expired-heists">
        <h2>All Expired Heists</h2>
        {expiredHeists.map((h) => (
          <p key={h.id}>{h.title}</p>
        ))}
      </div>
    </div>
  );
}
