"use client";

import { useTransition } from "react";

export default function StatusButtons({
  id, action,
}: {
  id: string;
  action: (id: string, status: "approved" | "rejected") => Promise<void>;
}) {
  const [pending, start] = useTransition();
  return (
    <span className="inline-flex gap-2">
      <button
        disabled={pending}
        onClick={() => start(() => action(id, "approved"))}
        className="text-green-600 text-xs hover:underline disabled:opacity-40"
      >
        อนุมัติ
      </button>
      <button
        disabled={pending}
        onClick={() => start(() => action(id, "rejected"))}
        className="text-red-600 text-xs hover:underline disabled:opacity-40"
      >
        ไม่อนุมัติ
      </button>
    </span>
  );
}
