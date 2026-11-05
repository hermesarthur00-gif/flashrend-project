"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setSuspended } from "../../actions";

export function SuspendButton({ userId, suspended }: { userId: string; suspended: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Button
      variant={suspended ? "primary" : "secondary"}
      className={suspended ? undefined : "text-down"}
      disabled={pending}
      onClick={() =>
        start(async () => {
          let reason: string | undefined;
          if (!suspended) {
            const r = prompt("Motif de la suspension (interne) :");
            if (r === null) return;
            reason = r;
          }
          const res = await setSuspended(userId, !suspended, reason);
          if (res?.error) toast.error(res.error);
          else {
            toast.success(res?.ok);
            router.refresh();
          }
        })
      }
    >
      {suspended ? "Réactiver le compte" : "Suspendre le compte"}
    </Button>
  );
}
