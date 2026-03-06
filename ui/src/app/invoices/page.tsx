"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InvoicesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/transactions");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  );
}
