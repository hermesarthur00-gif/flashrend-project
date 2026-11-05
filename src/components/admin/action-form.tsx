"use client";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AdminState } from "@/app/admin/actions";

/** Formulaire relié à une server action admin : toast du résultat et rafraîchissement. */
export function ActionForm({
  action,
  children,
  className,
  onDone,
  resetOnOk = false,
}: {
  action: (s: AdminState, f: FormData) => Promise<AdminState>;
  children: React.ReactNode;
  className?: string;
  onDone?: () => void;
  resetOnOk?: boolean;
}) {
  const router = useRouter();
  // Le toast part avant le nouveau rendu : le formulaire peut disparaître une fois l'action faite.
  const [state, formAction] = useActionState(async (prev: AdminState, fd: FormData) => {
    const res = await action(prev, fd);
    if (res?.error) toast.error(res.error);
    if (res?.ok) {
      toast.success(res.ok);
      onDone?.();
      router.refresh();
    }
    return res;
  }, undefined);
  return (
    <form action={formAction} className={className} key={resetOnOk && state?.ok ? JSON.stringify(state) : undefined}>
      {children}
    </form>
  );
}
