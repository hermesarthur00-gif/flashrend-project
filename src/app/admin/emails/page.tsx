import { Badge } from "@/components/app/primitives";
import { AdminHead, EmptyRow, Panel, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { formatDateTime } from "@/lib/utils";
import { countAllClients } from "./actions";
import { AutoRefresh } from "./auto-refresh";
import { Composer } from "./composer";

export const metadata = { title: "E-mails" };
// Un envoi à tous les clients continue en arrière-plan après la réponse.
export const maxDuration = 300;

const staleBefore = () => Date.now() - 15 * 60_000;
const AUDIENCE = { ALL: "Tous les clients", USER: "Un client", CUSTOM: "Adresses saisies" } as const;

export default async function EmailsPage() {
  const admin = await requireAdmin();
  const [clientCount, history] = await Promise.all([
    countAllClients(),
    db.emailBroadcast.findMany({ orderBy: { createdAt: "desc" }, take: 30, include: { author: { select: { name: true } } } }),
  ]);
  const stale = staleBefore();
  const sending = history.some((h) => h.status === "SENDING" && h.createdAt.getTime() > stale);

  return (
    <>
      <AutoRefresh active={sending} />
      <AdminHead title="E-mails" sub="Écrivez à tous vos clients, à un client ou à une adresse. Le message est mis dans le gabarit FlashRend." />
      <Composer clientCount={clientCount} adminEmail={admin.email} />
      <Panel title="Envois récents">
        <Table head={["Date", "Objet", "Destinataires", "Résultat", "Par"]} align={["left", "left", "left", "left", "left"]}>
          {history.length === 0 && <EmptyRow cols={5} text="Aucun e-mail envoyé pour l'instant." />}
          {history.map((h) => {
            const running = h.status === "SENDING";
            const interrupted = running && h.createdAt.getTime() <= stale;
            const files = Array.isArray(h.attachments) ? h.attachments.length : 0;
            return (
              <tr key={h.id}>
                <td className="whitespace-nowrap">{formatDateTime(h.createdAt)}</td>
                <td className="max-w-[320px]">
                  <span className="block truncate font-semibold">{h.subject}</span>
                  {files > 0 && <span className="text-xs text-ink-muted">{files} pièce{files > 1 ? "s" : ""} jointe{files > 1 ? "s" : ""}</span>}
                </td>
                <td>
                  <span className="block">{AUDIENCE[h.audience]}</span>
                  <span className="block max-w-[260px] truncate text-xs text-ink-muted">{h.audience === "ALL" ? `${h.recipients} destinataires` : h.target}</span>
                </td>
                <td className="whitespace-nowrap">
                  {interrupted ? <Badge tone="down">Interrompu</Badge> : running ? <Badge tone="info">En cours</Badge> : h.failed > 0 ? <Badge tone="warning">{h.failed} échec{h.failed > 1 ? "s" : ""}</Badge> : <Badge tone="up">Envoyé</Badge>}
                  <span className="ml-2 text-sm text-ink-muted tabular-nums">
                    {h.sent}/{h.recipients}
                  </span>
                </td>
                <td>{h.author.name}</td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </>
  );
}
