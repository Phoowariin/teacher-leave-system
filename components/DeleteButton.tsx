"use client";

import { useTransition } from "react";

export default function DeleteButton({
  id, action, label = "ลบ", confirmText = "ยืนยันการลบรายการนี้?",
}: {
  id: string;
  action: (id: string) => Promise<void>;
  label?: string;
  confirmText?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirm(confirmText)) start(() => action(id));
      }}
      className="text-red-600 text-xs hover:underline disabled:opacity-40"
    >
      {pending ? "..." : label}
    </button>
  );
}
