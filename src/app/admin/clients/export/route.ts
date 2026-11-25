import { headers } from "next/headers";
import { auth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { priceMap } from "@/lib/server/portfolio";

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  const me = session ? await db.user.findUnique({ where: { id: session.user.id } }) : null;
  if (!me || me.role !== "ADMIN") return new Response("Accès refusé", { status: 403 });
  const [users, pm] = await Promise.all([db.user.findMany({ where: { role: "CLIENT" }, include: { positions: true }, orderBy: { createdAt: "asc" } }), priceMap()]);
  const rows = [["Référence", "Prénom", "Nom", "E-mail", "Téléphone", "Profil", "Identité", "Suspendu", "Solde EUR", "Inscrit le"]];
  for (const u of users) {
    const value = Number(u.cashEur) + u.positions.reduce((s, p) => s + Number(p.quantity) * (pm.get(p.symbol)?.priceEur ?? 0), 0);
    rows.push([u.reference ?? "", u.firstName ?? "", u.lastName ?? "", u.email, u.phone ?? "", u.profile ?? "", u.kycStatus, u.suspendedAt ? "oui" : "non", value.toFixed(2).replace(".", ","), u.createdAt.toISOString().slice(0, 10)]);
  }
  await db.auditLog.create({ data: { actorId: me.id, action: "clients.export", data: { count: users.length } } });
  const body = "﻿" + rows.map((r) => r.map(cell).join(";")).join("\n");
  return new Response(body, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="clients-flashrend-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
