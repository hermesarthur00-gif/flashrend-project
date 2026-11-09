import { headers } from "next/headers";
import { auth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { resolveDocument } from "@/lib/server/uploads";

/** Document d'identité : réservé aux admins, lien temporaire, consultation notée au journal. */
export async function GET(_: Request, ctx: RouteContext<"/admin/documents/[id]/[side]">) {
  const { id, side } = await ctx.params;
  const session = await auth.api.getSession({ headers: await headers() });
  const me = session ? await db.user.findUnique({ where: { id: session.user.id } }) : null;
  if (!me || me.role !== "ADMIN") return new Response("Accès refusé", { status: 403 });
  const sub = await db.kycSubmission.findUnique({ where: { id } });
  const key = side === "recto" ? sub?.frontId : side === "verso" ? sub?.backId : side === "selfie" ? sub?.selfieId : null;
  if (!sub || !key) return new Response("Introuvable", { status: 404 });
  const doc = await resolveDocument(key);
  if (!doc) return new Response("Introuvable", { status: 404 });
  await db.auditLog.create({ data: { actorId: me.id, action: "kyc.document.view", targetType: "user", targetId: sub.userId, data: { side } } });
  const noStore = { "cache-control": "private, no-store" };
  if ("redirect" in doc) return new Response(null, { status: 302, headers: { location: doc.redirect, ...noStore } });
  return new Response(new Uint8Array(doc.body), { headers: { "content-type": doc.type, ...noStore } });
}
