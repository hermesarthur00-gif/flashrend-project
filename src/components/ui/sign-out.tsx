"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { IconLogout } from "@tabler/icons-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Logo } from "@/components/ui/logo";
import { authClient } from "@/lib/auth-client";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Déconnexion confirmée, puis écran d'au revoir : le fond jaune s'ouvre depuis le centre,
 * l'éclair rebondit et le prénom s'affiche, pendant que la session se ferme.
 */
export function SignOutDialog({ open, onClose, name }: { open: boolean; onClose: () => void; name?: string }) {
  const [leaving, setLeaving] = useState(false);
  const first = name?.trim().split(" ")[0];

  const confirm = async () => {
    onClose();
    setLeaving(true);
    await Promise.all([authClient.signOut().catch(() => null), wait(1700)]);
    window.location.replace("/account/connexion");
    return true;
  };

  return (
    <>
      <ConfirmDialog
        open={open}
        onClose={onClose}
        icon={<IconLogout size={24} stroke={1.75} />}
        title="Se déconnecter ?"
        description="Vous devrez saisir à nouveau votre e-mail et votre mot de passe, puis le code reçu par e-mail."
        confirmLabel="Se déconnecter"
        tone="danger"
        onConfirm={confirm}
      />
      {leaving &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="bye fixed inset-0 z-[200] grid place-items-center bg-flash text-on-flash" role="status" aria-live="assertive">
            <div className="flex flex-col items-center gap-5">
              <span className="bye-bolt">
                <Logo variant="symbol" size={88} />
              </span>
              <p className="bye-text text-h2 m-0">{first ? `À bientôt, ${first}.` : "À bientôt."}</p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
