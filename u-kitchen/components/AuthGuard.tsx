"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    const isLoginPage = pathname === "/";

    if (!loggedInUser && !isLoginPage) {
      router.push("/");
    }
  }, [pathname, router]);

  return <>{children}</>;
}