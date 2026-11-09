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
  let key: string | null | undefined = null;
  let userId: string | undefined;
  if (side === "preuve") {
    const dep = await db.deposit.findUnique({ where: { id } });
    key = dep?.proofId;
    userId = dep?.userId;
  } else {
    const sub = await db.kycSubmission.findUnique({ where: { id } });
    key = side === "recto" ? sub?.frontId : side === "verso" ? sub?.backId : side === "selfie" ? sub?.selfieId : null;
    userId = sub?.userId;
  }
  if (!key || !userId) return new Response("Introuvable", { status: 404 });
  const doc = await resolveDocument(key);
  if (!doc) return new Response("Introuvable", { status: 404 });
  await db.auditLog.create({ data: { actorId: me.id, action: side === "preuve" ? "deposit.proof.view" : "kyc.document.view", targetType: "user", targetId: userId, data: { side, id } } });
  const noStore = { "cache-control": "private, no-store" };
  if ("redirect" in doc) return new Response(null, { status: 302, headers: { location: doc.redirect, ...noStore } });
  return new Response(new Uint8Array(doc.body), { headers: { "content-type": doc.type, ...noStore } });
}
