"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect on auth pages
    if (pathname.startsWith("/auth")) return;
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/");
    }
  }, [router, pathname]);

  return <>{children}</>;
}
