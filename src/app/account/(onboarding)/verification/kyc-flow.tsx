"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconCamera, IconChevronLeft, IconCircleCheck, IconInfoCircle, IconUser } from "@tabler/icons-react";
import { toast } from "sonner";
import { Field } from "@/components/app/form";
import { Stripes } from "@/components/ui/decor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitKyc, uploadKycFile } from "./actions";

const STEPS = ["Adresse", "Pièce", "Selfie", "Validation"];
type Slot = { token: string; name: string; size: number } | null;

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

function Stepper({ current }: { current: number }) {
  return (
    <ol className="m-0 flex list-none gap-1.5 p-0" aria-label="Étapes">
      {STEPS.map((s, i) => (
        <li key={s} className="flex flex-1 flex-col gap-1.5" aria-current={i === current ? "step" : undefined}>
          <span className={cn("h-1.5 rounded-full", i <= current ? "bg-ink" : "bg-line")} />
          <span className={cn("text-caption", i === current ? "text-ink" : "text-ink-muted")}>{s}</span>
        </li>
      ))}
    </ol>
  );
}

function UploadTile({ label, slot, onFile, busy, capture }: { label: string; slot: Slot; onFile: (f: File) => void; busy: boolean; capture?: "user" | "environment" }) {
  return (
    <label
      className={cn(
        "relative flex h-[150px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg text-center",
        slot ? "bg-band text-on-band" : "border-2 border-dashed border-line-strong bg-surface-raised text-ink",
        busy && "opacity-60",
      )}
    >
      <input type="file" accept="image/*,application/pdf" capture={capture} className="sr-only" disabled={busy} onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      {slot ? (
        <>
          <span className="h-[60px] w-24 rounded-sm bg-on-band/15" />
          <span className="flex items-center gap-1.5 text-sm font-bold">
            <IconCircleCheck size={18} stroke={1.75} className="text-flash" />
            {label} ajouté
          </span>
          <span className="text-caption max-w-[90%] truncate opacity-75">
            {slot.name} · {(slot.size / 1024 / 1024).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Mo
          </span>
        </>
      ) : (
        <>
          <span className="grid size-11 place-items-center rounded-md bg-flash text-on-flash">
            <IconCamera size={22} stroke={1.75} />
          </span>
          <span className="text-sm font-bold">{busy ? "Envoi…" : label}</span>
          <span className="text-caption text-ink-muted">Photo ou fichier</span>
        </>
      )}
    </label>
  );
}

export function KycFlow({ rejected, defaults }: { rejected: React.ReactNode; defaults?: { birthDate: string; address: string; postalCode: string; city: string; country: string } }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState(defaults ?? { birthDate: "", address: "", postalCode: "", city: "", country: "France" });
  const [docType, setDocType] = useState<"id" | "passport">("id");
  const [files, setFiles] = useState<{ front: Slot; back: Slot; selfie: Slot }>({ front: null, back: null, selfie: null });
  const [busy, setBusy] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function upload(key: "front" | "back" | "selfie", raw: File) {
    setBusy(key);
    const file = await prepare(raw);
    if (file.size > 4 * 1024 * 1024) {
      setBusy(null);
      return toast.error("Fichier trop lourd (4 Mo maximum). Prenez une photo plutôt qu'un scan PDF.");
    }
    const fd = new FormData();
    fd.set("file", file);
    const res = await uploadKycFile(fd);
    setBusy(null);
    if (res.error || !res.token) return toast.error(res.error ?? "Envoi impossible.");
    setFiles((f) => ({ ...f, [key]: { token: res.token!, name: file.name, size: file.size } }));
  }

  async function finish() {
    setSending(true);
    const res = await submitKyc({ ...info, docType, front: files.front?.token ?? "", back: files.back?.token, selfie: files.selfie?.token ?? "" });
    if (res.error) {
      setSending(false);
      return toast.error(res.error);
    }
    router.refresh();
  }

  const heads = [
    ["Votre adresse", "Elle doit correspondre à celle de votre justificatif."],
    ["Votre pièce d'identité", "En cours de validité, lisible, les 4 coins visibles."],
    ["Un selfie pour confirmer", "Nous comparons votre visage à la photo de votre pièce."],
    ["Tout est prêt", "Vérifiez vos informations avant l'envoi."],
  ];
  const canNext0 = info.birthDate && info.address.trim().length > 3 && info.postalCode.trim() && info.city.trim() && info.country.trim();
  const canNext1 = files.front && (docType === "passport" || files.back);

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col lg:py-10">
      <header className="flex h-14 items-center gap-2 px-2">
        {step > 0 ? (
          <button type="button" aria-label="Retour" onClick={() => setStep(step - 1)} className="grid size-11 place-items-center rounded-md hover:bg-ink/8">
            <IconChevronLeft size={22} stroke={1.75} />
          </button>
        ) : (
          <Link href="/" aria-label="Retour au site" className="grid size-11 place-items-center rounded-md hover:bg-ink/8">
            <IconChevronLeft size={22} stroke={1.75} />
          </Link>
        )}
        <h1 className="m-0 flex-1 text-center text-[17px] font-bold">Vérification</h1>
        <span className="w-11 text-center text-[13px] font-bold text-ink-muted">{step + 1}/4</span>
      </header>
      <div className="px-4 pt-1">
        <Stepper current={step} />
      </div>
      <div className="px-4 pt-6">
        <h2 className="text-h2 m-0 mb-1.5">{heads[step][0]}</h2>
        <p className="m-0 text-ink-muted">{heads[step][1]}</p>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 pt-5 pb-4">
        {step === 0 && (
          <>
            {rejected}
            <Field label="Date de naissance" type="date" value={info.birthDate} onChange={(e) => setInfo({ ...info, birthDate: e.target.value })} required autoComplete="bday" />
            <Field label="Adresse" value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} placeholder="12 rue de la Paix" autoComplete="street-address" />
            <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3">
              <Field label="Code postal" value={info.postalCode} onChange={(e) => setInfo({ ...info, postalCode: e.target.value })} autoComplete="postal-code" />
              <Field label="Ville" value={info.city} onChange={(e) => setInfo({ ...info, city: e.target.value })} autoComplete="address-level2" />
            </div>
            <Field label="Pays de résidence" value={info.country} onChange={(e) => setInfo({ ...info, country: e.target.value })} autoComplete="country-name" />
          </>
        )}
        {step === 1 && (
          <>
            <div role="tablist" aria-label="Type de document" className="flex rounded-md bg-surface-sunken p-0.5">
              {(
                [
                  ["id", "Carte d'identité"],
                  ["passport", "Passeport"],
                ] as const
              ).map(([k, l]) => (
                <button key={k} type="button" role="tab" aria-selected={docType === k} onClick={() => setDocType(k)} className={cn("h-10 flex-1 rounded-sm text-sm font-semibold", docType === k ? "bg-surface-raised text-ink" : "text-ink-muted")}>
                  {l}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <UploadTile label={docType === "id" ? "Recto" : "Page photo"} slot={files.front} busy={busy === "front"} onFile={(f) => upload("front", f)} capture="environment" />
              {docType === "id" && <UploadTile label="Verso" slot={files.back} busy={busy === "back"} onFile={(f) => upload("back", f)} capture="environment" />}
            </div>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-sm">
              {["Pas de reflet ni de flou", "Document original, pas de photocopie", "JPG, PNG ou PDF, 4 Mo maximum"].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <IconInfoCircle size={20} stroke={1.75} className="shrink-0 text-ink-muted" />
                  {t}
                </li>
              ))}
            </ul>
          </>
        )}
        {step === 2 && (
          <label className="relative grid min-h-[320px] flex-1 cursor-pointer place-items-center overflow-hidden rounded-xl bg-band">
            <input type="file" accept="image/*" capture="user" className="sr-only" onChange={(e) => e.target.files?.[0] && upload("selfie", e.target.files[0])} />
            <div className="absolute top-4 left-4">
              <Stripes count={4} height={48} />
            </div>
            <div className="grid h-[250px] w-[190px] place-items-center rounded-[50%] border-[3px] border-dashed border-flash">
              {files.selfie ? <IconCircleCheck size={72} stroke={1.5} className="text-flash" /> : <IconUser size={96} stroke={1.25} className="text-on-band opacity-50" />}
            </div>
            <p className="absolute inset-x-0 bottom-4 m-0 text-center text-sm text-on-band">
              {busy === "selfie" ? "Envoi…" : files.selfie ? "Selfie ajouté. Touchez pour reprendre." : "Placez votre visage dans l'ovale, sans lunettes"}
            </p>
          </label>
        )}
        {step === 3 && (
          <div className="flex flex-col gap-3">
            {[
              ["Adresse", `${info.address}, ${info.postalCode} ${info.city}, ${info.country}`],
              ["Pièce d'identité", docType === "id" ? "Carte d'identité, recto et verso" : "Passeport"],
              ["Selfie", "Ajouté"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start gap-3 rounded-lg border border-line bg-surface-raised p-4">
                <IconCircleCheck size={22} stroke={1.75} className="shrink-0 text-up" />
                <div>
                  <p className="m-0 font-bold">{k}</p>
                  <p className="m-0 text-sm text-ink-muted">{v}</p>
                </div>
              </div>
            ))}
            <p className="m-0 text-sm text-ink-muted">En envoyant, vous certifiez l&apos;exactitude de ces informations. Vos documents sont conservés de façon sécurisée et ne servent qu&apos;à vérifier votre identité.</p>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-line bg-surface px-4 pt-3 pb-[max(20px,env(safe-area-inset-bottom))] lg:static lg:border-0">
        {step === 0 && (
          <Button size="lg" block disabled={!canNext0} onClick={() => setStep(1)}>
            Continuer
          </Button>
        )}
        {step === 1 && (
          <Button size="lg" block disabled={!canNext1 || Boolean(busy)} onClick={() => setStep(2)}>
            Continuer
          </Button>
        )}
        {step === 2 && (
          <Button size="lg" block disabled={!files.selfie || Boolean(busy)} onClick={() => setStep(3)}>
            Continuer
          </Button>
        )}
        {step === 3 && (
          <Button size="lg" block disabled={sending} onClick={finish}>
            {sending ? "Envoi…" : "Envoyer pour vérification"}
          </Button>
        )}
      </div>
    </div>
  );
}
