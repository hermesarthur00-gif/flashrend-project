"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconPaperclip, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import { Alert } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MAX_ATTACHMENTS_BYTES, MAX_ATTACHMENT_FILES } from "@/lib/mail-limits";
import { previewEmail, searchClients, sendBroadcast, sendTestEmail, type ClientHit } from "./actions";
import { RichEditor } from "./rich-editor";

type Audience = "ALL" | "USER" | "CUSTOM";
const MAX_FILES = MAX_ATTACHMENT_FILES;
const size = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1).replace(".", ",")} Mo` : `${Math.max(1, Math.round(n / 1024))} Ko`);

export function Composer({ clientCount, adminEmail }: { clientCount: number; adminEmail: string }) {
  const router = useRouter();
  const [audience, setAudience] = useState<Audience>("ALL");
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<ClientHit[]>([]);
  const [picked, setPicked] = useState<ClientHit | null>(null);
  const [emails, setEmails] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [preview, setPreview] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [pending, start] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const total = files.reduce((s, f) => s + f.size, 0);
  const tooBig = total > MAX_ATTACHMENTS_BYTES;

  useEffect(() => {
    if (audience !== "USER" || picked || query.trim().length < 2) return;
    let cancel = false;
    const t = setTimeout(() => searchClients(query).then((r) => !cancel && setHits(r)).catch(() => {}), 250);
    return () => {
      cancel = true;
      clearTimeout(t);
    };
  }, [query, audience, picked]);

  const recipientsReady = audience === "ALL" ? clientCount > 0 : audience === "USER" ? Boolean(picked) : emails.trim().length > 0;
  const ready = recipientsReady && subject.trim().length >= 3 && html.length > 0 && !tooBig;

  const form = () => {
    const fd = new FormData();
    fd.set("audience", audience);
    fd.set("subject", subject);
    fd.set("html", html);
    if (picked) fd.set("userId", picked.id);
    fd.set("emails", emails);
    for (const f of files) fd.append("files", f);
    return fd;
  };

  const showPreview = () => {
    setTab("preview");
    setPreview(null);
    previewEmail({ subject, html }).then((r) => setPreview(r.html));
  };
  const send = () =>
    start(async () => {
      const res = await sendBroadcast(undefined, form());
      setConfirm(false);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(res?.ok ?? "Envoyé");
      setSubject("");
      setHtml("");
      setFiles([]);
      setPicked(null);
      setQuery("");
      setHits([]);
      setEmails("");
      setTab("edit");
      setEditorKey((k) => k + 1);
      router.refresh();
    });
  const test = () =>
    start(async () => {
      const res = await sendTestEmail(undefined, form());
      if (res?.error) toast.error(res.error);
      else toast.success(res?.ok ?? "Test envoyé");
    });
  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files, ...Array.from(list)];
    if (next.length > MAX_FILES) toast.error(`${MAX_FILES} pièces jointes au maximum.`);
    setFiles(next.slice(0, MAX_FILES));
    if (fileInput.current) fileInput.current.value = "";
  };

  const seg = (a: Audience, label: string) => (
    <button key={a} type="button" role="tab" aria-selected={audience === a} onClick={() => { setAudience(a); setConfirm(false); }} className={cn("h-10 flex-1 rounded-sm px-3 text-sm font-semibold", audience === a ? "bg-surface-raised text-ink shadow-sm" : "text-ink-muted")}>
      {label}
    </button>
  );

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <section className="flex min-w-0 flex-col gap-4 rounded-lg border border-line bg-surface-raised p-5 lg:col-span-8">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="mail-subject" className="text-label">
            Objet
          </label>
          <input id="mail-subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} placeholder="Une information importante de FlashRend" className="h-12 w-full rounded-md border border-line-strong bg-surface-raised px-3.5 text-base outline-none focus:border-ink focus:ring-2 focus:ring-ink/15" />
        </div>
        <div className="flex gap-1 self-start rounded-md bg-surface-sunken p-0.5" role="tablist" aria-label="Mode">
          <button type="button" role="tab" aria-selected={tab === "edit"} onClick={() => setTab("edit")} className={cn("h-9 rounded-sm px-4 text-sm font-semibold", tab === "edit" ? "bg-surface-raised text-ink" : "text-ink-muted")}>
            Rédaction
          </button>
          <button type="button" role="tab" aria-selected={tab === "preview"} onClick={showPreview} disabled={html.length === 0} className={cn("h-9 rounded-sm px-4 text-sm font-semibold disabled:opacity-40", tab === "preview" ? "bg-surface-raised text-ink" : "text-ink-muted")}>
            Aperçu
          </button>
        </div>
        <div className={cn(tab !== "edit" && "hidden")}>
          <RichEditor key={editorKey} onChange={setHtml} />
        </div>
        {tab === "preview" &&
          (preview === null ? (
            <div className="grid h-[420px] place-items-center rounded-lg bg-surface-sunken text-ink-muted">Préparation de l&apos;aperçu…</div>
          ) : (
            <iframe title="Aperçu de l'e-mail" sandbox="" srcDoc={preview} className="h-[640px] w-full rounded-lg border border-line bg-white" />
          ))}
      </section>

      <aside className="flex min-w-0 flex-col gap-5 lg:col-span-4">
        <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
          <h2 className="text-h3 m-0">Destinataires</h2>
          <div className="flex gap-0.5 rounded-md bg-surface-sunken p-0.5" role="tablist" aria-label="Destinataires">
            {seg("ALL", "Tous")}
            {seg("USER", "Un client")}
            {seg("CUSTOM", "Adresse")}
          </div>
          {audience === "ALL" && (
            <p className="m-0 text-[15px]">
              <strong>{clientCount.toLocaleString("fr-FR")}</strong> client{clientCount > 1 ? "s" : ""} actif{clientCount > 1 ? "s" : ""}, adresse e-mail confirmée. Les administrateurs et les comptes bannis ou supprimés sont exclus.
            </p>
          )}
          {audience === "USER" &&
            (picked ? (
              <div className="flex items-center gap-2 rounded-md bg-flash-soft px-3 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{picked.name}</span>
                  <span className="block truncate text-sm text-ink-muted">{picked.email}</span>
                </span>
                <button type="button" aria-label="Changer de client" onClick={() => { setPicked(null); setQuery(""); setHits([]); }} className="grid size-8 place-items-center rounded-sm hover:bg-ink/8">
                  <IconX size={18} stroke={1.75} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Rechercher un client" placeholder="Nom, e-mail ou référence" className="h-11 w-full rounded-md border border-line-strong bg-surface-raised px-3.5 outline-none focus:border-ink" />
                {hits.length > 0 && (
                  <ul className="m-0 flex list-none flex-col overflow-hidden rounded-md border border-line p-0">
                    {hits.map((h) => (
                      <li key={h.id} className="border-b border-line last:border-b-0">
                        <button type="button" onClick={() => setPicked(h)} className="flex w-full flex-col px-3 py-2 text-left hover:bg-surface-sunken">
                          <span className="font-semibold">{h.name}</span>
                          <span className="text-sm text-ink-muted">
                            {h.email}
                            {h.reference ? ` · ${h.reference}` : ""}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {query.trim().length >= 2 && hits.length === 0 && <p className="m-0 text-sm text-ink-muted">Aucun client trouvé.</p>}
              </div>
            ))}
          {audience === "CUSTOM" && (
            <div className="flex flex-col gap-1.5">
              <textarea value={emails} onChange={(e) => setEmails(e.target.value)} aria-label="Adresses e-mail" rows={3} placeholder="nom@exemple.com" className="w-full resize-y rounded-md border border-line-strong bg-surface-raised px-3.5 py-2.5 outline-none focus:border-ink" />
              <p className="m-0 text-sm text-ink-muted">Une ou plusieurs adresses (20 au maximum), séparées par une virgule ou un retour à la ligne.</p>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
          <h2 className="text-h3 m-0">Pièces jointes</h2>
          <input ref={fileInput} type="file" multiple hidden onChange={(e) => addFiles(e.target.files)} />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            className="flex h-20 items-center justify-center gap-2 rounded-md border-2 border-dashed border-line-strong text-sm font-semibold text-ink-muted hover:border-ink hover:text-ink"
          >
            <IconPaperclip size={20} stroke={1.75} /> Ajouter ou glisser des fichiers
          </button>
          {files.length > 0 && (
            <ul className="m-0 flex list-none flex-col p-0">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center gap-2 border-t border-line py-2 first:border-t-0">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold">{f.name}</span>
                    <span className="block text-xs text-ink-muted">{size(f.size)}</span>
                  </span>
                  <button type="button" aria-label={`Retirer ${f.name}`} onClick={() => setFiles((l) => l.filter((_, j) => j !== i))} className="grid size-8 place-items-center rounded-sm hover:bg-surface-sunken">
                    <IconX size={18} stroke={1.75} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className={cn("m-0 text-sm", tooBig ? "font-semibold text-down" : "text-ink-muted")}>
            {size(total || 0)} sur 4 Mo · {MAX_FILES} fichiers au maximum
          </p>
        </section>

        <section className="flex flex-col gap-3 rounded-lg border border-line bg-surface-raised p-5">
          {confirm ? (
            <Alert tone="warning" title={`Envoyer à ${clientCount.toLocaleString("fr-FR")} clients ?`}>
              Cet envoi est définitif. Faites d&apos;abord un test pour relire le rendu.
            </Alert>
          ) : null}
          <div className="flex flex-col gap-2">
            {confirm ? (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => setConfirm(false)} disabled={pending}>
                  Annuler
                </Button>
                <Button onClick={send} disabled={pending}>
                  {pending ? "Envoi…" : "Confirmer l'envoi"}
                </Button>
              </div>
            ) : (
              <Button size="lg" block disabled={!ready || pending} onClick={() => (audience === "ALL" ? setConfirm(true) : send())}>
                {pending ? "Envoi…" : audience === "ALL" ? `Envoyer à ${clientCount.toLocaleString("fr-FR")} clients` : "Envoyer"}
              </Button>
            )}
            <Button variant="secondary" block disabled={html.length === 0 || pending || tooBig} onClick={test}>
              M&apos;envoyer un test
            </Button>
            <p className="m-0 text-center text-xs text-ink-muted">Le test part à {adminEmail}</p>
          </div>
        </section>
      </aside>
    </div>
  );
}
