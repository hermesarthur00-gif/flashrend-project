import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/lib/site-config";
import { BOLT, SQUIRCLE } from "@/components/ui/logo";

export const alt = `${siteConfig.name} · Investir en crypto, sans tracas`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const batica = await readFile(join(process.cwd(), "src/app/fonts/BaticaSans-Regular.ttf"));

/** Image de partage générée à partir du nom du site (siteConfig.name). */
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 44, background: "#FDD700" }}>
        <svg viewBox="0 0 100 100" width={170} height={170}>
          <path d={SQUIRCLE} fill="#111110" />
          <path d={BOLT} fill="#FDD700" />
        </svg>
        <div style={{ display: "flex", fontFamily: "Batica", fontSize: 128, color: "#111110", letterSpacing: -3 }}>{siteConfig.name}</div>
      </div>
    ),
    { ...size, fonts: [{ name: "Batica", data: batica, style: "normal", weight: 400 }] },
  );
}
