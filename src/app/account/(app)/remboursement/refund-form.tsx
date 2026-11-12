"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SelectField, TextArea } from "@/components/app/form";
import { Button } from "@/components/ui/button";
import { REFUND_REASONS } from "@/lib/refund";
import { requestRefund } from "./actions";

export function RefundForm({ deposits, initial }: { deposits: { id: string; label: string }[]; initial?: string }) {
  const router = useRouter();
  const [depositId, setDepositId] = useState(deposits.find((d) => d.id === initial)?.id ?? deposits[0]?.id ?? "");
  const [reason, setReason] = useState("MISTAKE");
  const [details, setDetails] = useState("");
  const [pending, start] = useTransition();
  return (
    <form
      className="flex flex-col gap-3.5"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await requestRefund({ depositId, reason, details });
          if ("error" in res && res.error) toast.error(res.error);
          else {
            toast.success("Demande envoyée");
            setDetails("");
            router.refresh();
          }
        });
      }}
    >
      <SelectField label="Dépôt concerné" value={depositId} onChange={(e) => setDepositId(e.target.value)}>
        {deposits.map((d) => (
          <option key={d.id} value={d.id}>
            {d.label}
          </option>
        ))}
      </SelectField>
      <SelectField label="Motif" value={reason} onChange={(e) => setReason(e.target.value)}>
        {Object.entries(REFUND_REASONS).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </SelectField>
      <TextArea label={reason === "OTHER" ? "Précisions" : "Précisions (facultatif)"} value={details} onChange={(e) => setDetails(e.target.value)} maxLength={1000} rows={3} />
      <Button type="submit" size="lg" block disabled={pending || !depositId}>
        {pending ? "Envoi…" : "Envoyer la demande"}
      </Button>
    </form>
  );
}
