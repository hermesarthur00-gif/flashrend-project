import { headers } from "next/headers";
import { auth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

/** Nombre de notifications non lues et la plus récente (cloche de l'app). */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ count: 0, latest: null }, { status: 401 });
  const [count, latest] = await Promise.all([
    db.notification.count({ where: { userId: session.user.id, readAt: null } }),
    db.notification.findFirst({ where: { userId: session.user.id, readAt: null }, orderBy: { createdAt: "desc" }, select: { id: true, title: true, body: true, url: true } }),
  ]);
  return Response.json({ count, latest }, { headers: { "cache-control": "private, no-store" } });
}
