"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Sommaire du guide : suit le défilement et met en avant la section lue. */
export function GuideToc({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    for (const it of items) {
      const el = document.getElementById(it.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="Sommaire du guide" className="flex flex-col gap-0.5">
      <p className="text-overline m-0 mb-2 px-3 text-ink-muted">Sommaire</p>
      {items.map((it, i) => (
        <a
          key={it.id}
          href={`#${it.id}`}
          aria-current={active === it.id ? "true" : undefined}
          className={cn("flex gap-2.5 rounded-md px-3 py-2 text-sm font-semibold", active === it.id ? "bg-flash-soft text-ink" : "text-ink-muted hover:bg-surface-sunken hover:text-ink")}
        >
          <span className="w-5 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
          {it.label}
        </a>
      ))}
    </nav>
  );
}
