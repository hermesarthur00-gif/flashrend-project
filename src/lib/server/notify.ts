import "server-only";
import webpush from "web-push";
import { db } from "./db";
import { sendEmail } from "./email";
import { noticeEmail } from "./email-templates";

let vapidReady: boolean | null = null;
function ensureVapid() {
  if (vapidReady !== null) return vapidReady;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  vapidReady = Boolean(pub && priv);
  if (vapidReady) webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? "mailto:contact@flashinv.com", pub!, priv!);
  return vapidReady;
}

export type NotifyKind = "deposit" | "withdrawal" | "kyc" | "rebalance" | "info";

/** Notification interne + web push, et e-mail si demandé. */
export async function notify(
  userId: string,
  n: { kind: NotifyKind; title: string; body: string; url?: string; email?: { lines?: string[]; cta?: string } },
) {
  await db.notification.create({ data: { userId, kind: n.kind, title: n.title, body: n.body, url: n.url } });

  if (ensureVapid()) {
    const subs = await db.pushSubscription.findMany({ where: { userId } });
    const payload = JSON.stringify({ title: n.title, body: n.body, url: n.url ?? "/account" });
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 86400 });
        } catch (e) {
          const code = (e as { statusCode?: number }).statusCode;
          if (code === 404 || code === 410) await db.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        }
      }),
    );
  }

  if (n.email) {
    const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (user) {
      const mail = noticeEmail({
        title: n.title,
        lines: n.email.lines ?? [n.body],
        cta: n.url ? { label: n.email.cta ?? "Ouvrir FlashInv", path: n.url } : undefined,
      });
      await sendEmail({ to: user.email, ...mail });
    }
  }
}
