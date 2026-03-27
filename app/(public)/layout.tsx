"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock8 } from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/heists");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="center-content">
        <Clock8 className="animate-spin" size={32} strokeWidth={2.75} />
      </div>
    );
  }

  if (user) return null;

  return <main className="public">{children}</main>;
}
