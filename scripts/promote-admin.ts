/**
 * Donne le rôle administrateur à un compte existant.
 * Sert à créer le premier admin : les suivants se gèrent dans l'admin (Réglages > Équipe ou fiche client).
 *
 *   pnpm admin:promote vous@exemple.com
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"], quiet: true });
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage : pnpm admin:promote vous@exemple.com");
  process.exit(1);
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new Error(`Aucun compte avec l'e-mail ${email}. Créez-le d'abord sur /account/inscription.`);
  if (!user.emailVerified) throw new Error("Confirmez d'abord l'adresse e-mail de ce compte (code reçu à l'inscription).");
  if (user.suspendedAt) throw new Error("Ce compte est suspendu ou supprimé.");
  if (user.role === "ADMIN") {
    console.log(`${email} est déjà administrateur.`);
    return;
  }
  await db.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
  await db.auditLog.create({ data: { actorId: user.id, action: "team.add", targetType: "user", targetId: user.id, data: { email, via: "cli" } } });
  console.log(`${email} est maintenant administrateur : /admin est accessible.`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
