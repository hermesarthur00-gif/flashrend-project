import Image from "next/image";
import { cn } from "@/lib/utils";
import { BOLT_PATH } from "./logo";

/** Pièce FlashRend en volume (noir mat ou jaune). */
export function Coin({
  tone = "black",
  size = 96,
  tilt = 0,
  spin = 0,
  className,
}: {
  tone?: "black" | "yellow";
  size?: number;
  tilt?: number;
  spin?: number;
  className?: string;
}) {
  const t = Math.max(3, Math.round(size * 0.07));
  const edgeA = tone === "yellow" ? "#C9A400" : "#2B2A26";
  const edgeB = tone === "yellow" ? "#9E8000" : "#0A0A09";
  const layers: string[] = [];
  for (let i = 1; i <= t; i++) layers.push(`0 ${i}px 0 ${i < t ? edgeA : edgeB}`);
  layers.push(`inset 0 ${Math.round(size * 0.025)}px 0 rgba(255,255,255,${tone === "yellow" ? ".45" : ".10"})`);
  layers.push(`inset 0 -${Math.round(size * 0.03)}px 0 rgba(0,0,0,${tone === "yellow" ? ".12" : ".35"})`);
  layers.push(`0 ${t + Math.round(size * 0.12)}px ${Math.round(size * 0.22)}px -${Math.round(size * 0.06)}px rgba(17,17,16,.38)`);
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none", className)}
      style={{ width: size, height: size, transform: `perspective(${size * 6}px) rotateX(${tilt}deg) rotate(${spin}deg)` }}
    >
      <div
        className="relative grid size-full place-items-center rounded-full"
        style={{ background: tone === "yellow" ? "#FDD700" : "#161614", boxShadow: layers.join(", ") }}
      >
        <div
          className="absolute inset-[9%] rounded-full"
          style={{ border: `${Math.max(1, Math.round(size / 60))}px solid ${tone === "yellow" ? "rgba(17,17,16,.18)" : "rgba(253,215,0,.28)"}` }}
        />
        <svg viewBox="0 0 100 100" className="size-[64%]" style={{ filter: `drop-shadow(0 ${Math.max(1, Math.round(size / 70))}px 0 ${tone === "yellow" ? "rgba(255,255,255,.5)" : "rgba(0,0,0,.6)"})` }}>
          <path d={BOLT_PATH} fill={tone === "yellow" ? "#111110" : "#FDD700"} />
        </svg>
      </div>
    </div>
  );
}

/** Barres inclinées à l'angle de l'éclair. */
export function Stripes({ count = 5, height = 112, color = "var(--flash)", className }: { count?: number; height?: number; color?: string; className?: string }) {
  const bw = Math.round(height * 0.107);
  const pitch = bw * 2;
  const s = Math.round(height * 0.25);
  const w = s + count * pitch;
  return (
    <svg aria-hidden="true" width={w} height={height} viewBox={`0 0 ${w} ${height}`} className={cn("block", className)}>
      {Array.from({ length: count }, (_, i) => {
        const x = s + i * pitch;
        return <polygon key={i} points={`${x},0 ${x + bw},0 ${x + bw - s},${height} ${x - s},${height}`} fill={color} />;
      })}
    </svg>
  );
}

/** Grand éclair en filigrane. */
export function BoltWatermark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" className={cn("pointer-events-none absolute", className)}>
      <path d={BOLT_PATH} fill="var(--flash-hover)" />
    </svg>
  );
}

const GLYPHS = {
  btc: "/images/btc.png",
  eth: "/images/eth.png",
  bnb: "/images/bnb.png",
  doge: "/images/doge.png",
} as const;

/** Symboles crypto 3D fournis par le client, flottants. */
export function FloatingGlyph({ name, size = 88, rotate = 0, className }: { name: keyof typeof GLYPHS; size?: number; rotate?: number; className?: string }) {
  return (
    <Image
      src={GLYPHS[name]}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      data-float
      className={cn("pointer-events-none absolute drop-shadow-[0_14px_18px_rgba(17,17,16,.28)]", className)}
      style={{ rotate: `${rotate}deg` }}
    />
  );
}
