"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { IconBolt, IconBuildingBank, IconCamera, IconChevronLeft, IconCircleCheck, IconShare } from "@tabler/icons-react";
import { toast } from "sonner";
import { Alert, Card, Glyph, IconTile } from "@/components/app/primitives";
import { CopyButton } from "@/components/app/form";
import { Button } from "@/components/ui/button";
import { cn, formatEUR } from "@/lib/utils";
import { submitDeposit } from "./actions";

type Bank = { beneficiary: string; iban: string; swift: string; bankName: string; bankAddress: string };
type Method = "STANDARD" | "INSTANT";

/** Réduit les photos (2000 px, JPEG) pour rester sous la limite d'envoi. */
async function prepare(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size < 1.5 * 1024 * 1024) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

function Head({ title, onBack, step }: { title: string; onBack?: () => void; step: number }) {
  const cls = "grid size-11 place-items-center rounded-md hover:bg-ink/8";
  return (
    <header className="flex h-14 items-center gap-2 px-2 lg:px-0">
      {onBack ? (
        <button type="button" onClick={onBack} aria-label="Retour" className={cls}>
          <IconChevronLeft size={22} stroke={1.75} />
        </button>
      ) : (
        <Link href="/account" aria-label="Retour" className={cls}>
          <IconChevronLeft size={22} stroke={1.75} />
        </Link>
      )}
      <h1 className="m-0 flex-1 text-center text-[17px] leading-6 font-bold lg:text-left lg:text-h2">{title}</h1>
      <span className="w-11 text-center text-[13px] font-bold text-ink-muted">{step}/3</span>
    </header>
  );
}

function CopyRow({ label, value, display, highlight }: { label: string; value: string; display?: string; highlight?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", highlight ? "mt-1 rounded-md bg-flash p-3 text-on-flash" : "border-t border-line py-3 first:border-t-0")}>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className={cn("text-caption", highlight ? "text-on-flash" : "text-ink-muted")}>{label}</span>
        <span className="text-[15px] font-bold [overflow-wrap:anywhere] tabular-nums">{display ?? value}</span>
      </div>
      <CopyButton value={value} label={label} />
    </div>
  );
}

export function DepositFlow({ reference, bank, min, delays }: { reference: string; bank: Bank; min: number; delays: Record<Method, string> }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [method, setMethod] = useState<Method>("STANDARD");
  const [raw, setRaw] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, start] = useTransition();
  const amount = Number(raw.replace(/\s/g, "").replace(",", ".")) || 0;
  const tooLow = amount > 0 && amount < min;

  if (step === 1) {
    return (
      <>
        <Head title="Déposer" step={1} />
        <div className="flex flex-col gap-4 px-4 pt-2 pb-6 lg:px-0">
          <div className="relative pr-16">
            <h2 className="text-h2 m-0 mb-1.5 max-w-[16ch]">Comment faites-vous le virement ?</h2>
            <p className="m-0 text-ink-muted">En euros, depuis un compte bancaire à votre nom. Votre solde est crédité après vérification par FlashRend.</p>
            <Glyph name="btc" size={56} rotate={12} className="-top-1.5 right-0" />
          </div>
          <div role="radiogroup" aria-label="Type de virement" className="flex flex-col gap-3">
            {(
              [
                ["STANDARD", "Virement classique", IconBuildingBank],
                ["INSTANT", "Virement instantané", IconBolt],
              ] as const
            ).map(([m, label, Icon]) => {
              const sel = m === method;
              return (
                <button key={m} type="button" role="radio" aria-checked={sel} onClick={() => setMethod(m)} className={cn("flex w-full items-center gap-3.5 rounded-lg p-4 text-left text-ink", sel ? "border-2 border-ink bg-flash-soft" : "border border-line bg-surface-raised")}>
                  <IconTile tone={sel ? "flash" : "sunken"} size={48}>
                    <Icon size={24} stroke={1.75} />
                  </IconTile>
                  <span className="flex flex-1 flex-col">
                    <span className="text-[17px] font-bold">{label}</span>
                    <span className="text-sm text-ink-muted">Crédité sous {delays[m]}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {method === "INSTANT" && (
            <p className="m-0 text-sm text-ink-muted">Le virement instantané arrive en quelques secondes. Votre banque peut le facturer.</p>
          )}
          <Button size="lg" block className="mt-2" onClick={() => setStep(2)}>
            Voir les coordonnées
          </Button>
          <p className="m-0 text-center text-sm text-ink-muted">
            Un dépôt fait par erreur ?{" "}
            <Link href="/account/remboursement" className="font-semibold text-ink underline underline-offset-2">
              Demander un remboursement
            </Link>
          </p>
        </div>
      </>
    );
  }

  if (step === 2) {
    const shareText = ["Virement FlashRend", `Bénéficiaire : ${bank.beneficiary}`, `IBAN : ${bank.iban}`, bank.swift && `BIC / SWIFT : ${bank.swift}`, bank.bankName && `Banque : ${bank.bankName}`, `Référence : ${reference}`].filter(Boolean).join("\n");
    return (
      <>
        <Head title="Virement en euros" onBack={() => setStep(1)} step={2} />
        <div className="flex flex-col gap-4 px-4 pt-1 pb-6 lg:px-0">
          <p className="m-0 text-ink-muted">Depuis votre banque, faites un {method === "INSTANT" ? "virement instantané" : "virement"} en euros vers ce compte.</p>
          <Alert tone="info" title="Compte de notre gestionnaire de paiement">
            Ces coordonnées sont celles de notre gestionnaire de paiement, qui reçoit les dépôts pour FlashRend. Le bénéficiaire peut donc être différent de FlashRend : c&apos;est normal.
          </Alert>
          <Card>
            <CopyRow label="Bénéficiaire" value={bank.beneficiary} />
            <CopyRow label="IBAN" value={bank.iban} display={bank.iban.replace(/(.{4})/g, "$1 ").trim()} />
            {bank.swift && <CopyRow label="BIC / SWIFT" value={bank.swift} />}
            {bank.bankName && <CopyRow label="Banque" value={bank.bankName} />}
            {bank.bankAddress && <CopyRow label="Adresse de la banque" value={bank.bankAddress} />}
            <CopyRow label="Référence à indiquer" value={reference} highlight />
          </Card>
          <Alert tone="warning" title="N'oubliez pas la référence">
            Elle nous permet de reconnaître votre virement.
          </Alert>
          <div className="mt-2 flex flex-col gap-2">
            <Button size="lg" block onClick={() => setStep(3)}>
              J&apos;ai fait le virement
            </Button>
            <Button
              variant="ghost"
              size="lg"
              block
              onClick={async () => {
                if (navigator.share) await navigator.share({ title: "Coordonnées FlashRend", text: shareText }).catch(() => {});
                else {
                  await navigator.clipboard.writeText(shareText);
                  toast.success("Coordonnées copiées");
                }
              }}
            >
              <IconShare size={20} stroke={1.75} /> Partager les coordonnées
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head title="Déclarer le virement" onBack={() => setStep(2)} step={3} />
      <form
        className="flex flex-col gap-5 px-4 pt-2 pb-6 lg:px-0"
        onSubmit={(e) => {
          e.preventDefault();
          if (!proof) return toast.error("Ajoutez la preuve du virement.");
          start(async () => {
            const fd = new FormData();
            fd.set("method", method);
            fd.set("amount", raw);
            fd.set("proof", proof);
            const res = await submitDeposit(fd);
            if (res?.error) toast.error(res.error);
          });
        }}
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="amount" className="text-label">
            Montant viré
          </label>
          <div className="flex items-baseline gap-2 border-b-2 border-ink pb-1">
            <input id="amount" inputMode="decimal" autoComplete="off" placeholder="0" value={raw} onChange={(e) => setRaw(e.target.value.replace(/[^\d.,\s]/g, ""))} className="text-amount-xl w-full min-w-0 bg-transparent outline-none placeholder:text-ink-muted/50" aria-invalid={tooLow || undefined} required />
            <span className="text-h2 text-ink-muted">€</span>
          </div>
          <p className={cn("m-0 text-sm", tooLow ? "text-down" : "text-ink-muted")}>
            Minimum {formatEUR(min)}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-label">Preuve du virement</span>
          <label className={cn("relative flex min-h-[132px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg p-4 text-center", proof ? "bg-band text-on-band" : "border-2 border-dashed border-line-strong bg-surface-raised")}>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="sr-only"
              disabled={busy}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setBusy(true);
                const ready = await prepare(f);
                setBusy(false);
                if (ready.size > 4 * 1024 * 1024) return toast.error("Fichier trop lourd (4 Mo maximum). Une capture d'écran suffit.");
                setProof(ready);
              }}
            />
            {proof ? (
              <>
                <IconCircleCheck size={28} stroke={1.75} className="text-flash" />
                <span className="text-sm font-bold">Preuve ajoutée</span>
                <span className="text-caption max-w-[90%] truncate opacity-75">{proof.name} · touchez pour changer</span>
              </>
            ) : (
              <>
                <span className="grid size-11 place-items-center rounded-md bg-flash text-on-flash">
                  <IconCamera size={22} stroke={1.75} />
                </span>
                <span className="text-sm font-bold">{busy ? "Préparation…" : "Ajouter la preuve"}</span>
                <span className="text-caption text-ink-muted">Capture d&apos;écran ou PDF de l&apos;ordre de virement</span>
              </>
            )}
          </label>
        </div>
        <Alert tone="info" title={`Délai de vérification : ${delays[method]}`}>
          Nous vérifions la réception sur notre compte, puis votre solde est crédité. Vous êtes prévenu par notification et par e-mail.
        </Alert>
        <Button type="submit" size="lg" block disabled={pending || busy || !amount || tooLow || !proof}>
          {pending ? "Envoi…" : "Envoyer pour vérification"}
        </Button>
      </form>
    </>
  );
}
