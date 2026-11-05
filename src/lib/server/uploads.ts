import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";

/**
 * Pièces d'identité : stockées sur Cloudinary en accès authentifié.
 * Identifiant enregistré : "cld|<resource_type>|<format>|<public_id>".
 * Sans Cloudinary (développement), fichier local dans .uploads/ : "local|<mime>|<nom>".
 */
const LOCAL_DIR = path.join(process.cwd(), ".uploads");
export const MAX_UPLOAD = 8 * 1024 * 1024;
export const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];

function configured() {
  const { CLOUDINARY_CLOUD_NAME: c, CLOUDINARY_API_KEY: k, CLOUDINARY_API_SECRET: s } = process.env;
  if (!c || !k || !s) return false;
  cloudinary.config({ cloud_name: c, api_key: k, api_secret: s, secure: true });
  return true;
}

export async function uploadPrivate(file: File, folder: string): Promise<string> {
  if (!ACCEPTED.includes(file.type)) throw new Error("Format non accepté (JPG, PNG, WEBP, HEIC ou PDF).");
  if (file.size > MAX_UPLOAD) throw new Error("Fichier trop lourd (8 Mo maximum).");
  const buffer = Buffer.from(await file.arrayBuffer());

  if (!configured()) {
    if (process.env.NODE_ENV === "production" && process.env.UPLOADS_LOCAL !== "1") throw new Error("Stockage des documents non configuré.");
    await mkdir(LOCAL_DIR, { recursive: true });
    const name = `${randomUUID()}`;
    await writeFile(path.join(LOCAL_DIR, name), buffer);
    return `local|${file.type}|${name}`;
  }

  const result = await new Promise<{ public_id: string; resource_type: string; format: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: `flashinv/${folder}`, type: "authenticated", resource_type: "auto" }, (err, res) => (err || !res ? reject(err) : resolve(res)))
      .end(buffer);
  });
  return `cld|${result.resource_type}|${result.format}|${result.public_id}`;
}

/** Lien de lecture temporaire (5 minutes) ou contenu local. */
export async function resolveDocument(id: string): Promise<{ redirect: string } | { body: Buffer; type: string } | null> {
  const parts = id.split("|");
  if (parts[0] === "local") {
    const body = await readFile(path.join(LOCAL_DIR, path.basename(parts[2]))).catch(() => null);
    return body ? { body, type: parts[1] } : null;
  }
  if (parts[0] === "cld" && configured()) {
    const [, resourceType, format, publicId] = parts;
    const url = cloudinary.utils.private_download_url(publicId, format, {
      type: "authenticated",
      resource_type: resourceType,
      expires_at: Math.floor(Date.now() / 1000) + 300,
    });
    return { redirect: url };
  }
  return null;
}
