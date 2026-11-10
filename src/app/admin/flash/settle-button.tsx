"use client";
import { ActionForm } from "@/components/admin/action-form";
import { SubmitButton } from "@/components/app/form";
import { settleFlashNow } from "../actions";

export function SettleButton() {
  return (
    <ActionForm action={settleFlashNow}>
      <SubmitButton variant="secondary" size="md" pendingLabel="Clôture…">
        Clôturer les échéances
      </SubmitButton>
    </ActionForm>
  );
}
