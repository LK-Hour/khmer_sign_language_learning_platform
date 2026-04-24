"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { getCurrentRole, hasAccessToken } from "@/lib/api/client";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps): JSX.Element {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    if (!hasAccessToken()) {
      router.replace("/login");
      return;
    }

    const role = getCurrentRole();
    if (role === "ADMIN") {
      setIsAllowed(true);
      return;
    }

    router.replace("/dashboard");
  }, [router]);

  if (!isAllowed) {
    return <main style={{ padding: "2rem" }}>Checking access...</main>;
  }

  return <>{children}</>;
}
