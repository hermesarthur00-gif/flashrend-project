import { config } from "dotenv";
config({ path: [".env.local", ".env"], quiet: true });
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Lu sans exiger la variable : « prisma generate » (postinstall, build) n'a pas besoin de la base.
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
