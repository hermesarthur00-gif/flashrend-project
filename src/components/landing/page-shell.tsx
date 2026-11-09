import { BoltWatermark, FloatingGlyph, Stripes } from "@/components/ui/decor";
import { getSettings } from "@/lib/server/settings";

/** En-tête des pages secondaires : bloc jaune + bande noire, comme le hero. */
export function PageHero({
  eyebrow,
  title,
  lead,
  glyph,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  glyph?: "btc" | "eth" | "bnb" | "doge";
}) {
  return (
    <section className="mx-auto max-w-[1200px] px-3 pt-1 md:px-8 md:pt-2">
      <div className="overflow-hidden rounded-xl bg-band">
        <div data-hero-copy className="relative flex flex-col gap-4 overflow-hidden rounded-xl bg-flash px-5 pt-8 pb-8 text-on-flash md:px-16 md:pt-14 md:pb-14">
          <BoltWatermark className="-top-28 -right-24 size-[360px] md:-top-40 md:right-10 md:size-[520px]" />
          <p className="text-overline relative self-start rounded-sm bg-on-flash px-3 py-1.5 text-flash">{eyebrow}</p>
          {lead && <p className="text-body-lg relative max-w-[46ch]">{lead}</p>}
          {glyph && <FloatingGlyph name={glyph} size={96} rotate={12} className="top-6 right-6 size-16 md:top-10 md:right-24 md:size-24" />}
        </div>
        <div className="relative px-5 pt-6 pb-8 md:px-16 md:pt-10 md:pb-12">
          <h1 data-hero-title className="m-0 max-w-[18ch] font-display text-[40px] leading-[40px] font-normal tracking-[-0.025em] text-on-band md:text-[72px] md:leading-[68px]">
            {title}
          </h1>
          <Stripes count={5} height={64} className="absolute right-6 bottom-8 hidden md:block md:right-16 md:bottom-12" />
        </div>
      </div>
    </section>
  );
}

export type LegalSection = { id: string; title: string; body: React.ReactNode };

/** Page de texte juridique avec sommaire. */
export async function LegalPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro?: string; sections: LegalSection[] }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} lead={intro} />
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 pt-10 pb-16 md:grid-cols-12 md:gap-12 md:px-8 md:pt-16 md:pb-24">
        <aside className="md:col-span-4">
          <nav aria-label="Sommaire" className="rounded-lg border border-line bg-surface-raised p-5 md:sticky md:top-6">
            <p className="text-overline mb-3 text-ink-muted">Sommaire</p>
            <ol className="m-0 flex list-none flex-col gap-1 p-0">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="flex gap-3 rounded-sm px-2 py-1.5 text-sm font-semibold text-ink no-underline hover:bg-surface-sunken">
                    <span className="w-5 text-flash-text tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
            <p className="text-caption mt-4 border-t border-line pt-3 text-ink-muted">Mis à jour le {(await getSettings()).legal.lastUpdated}</p>
          </nav>
        </aside>
        <article className="flex flex-col gap-10 md:col-span-8">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-6">
              <h2 className="text-h3 mb-3 flex items-baseline gap-3 md:text-h2">
                <span className="font-display text-flash-text">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              <div className="flex max-w-[68ch] flex-col gap-3 text-body text-ink-muted [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink [&_a]:font-semibold [&_a]:text-ink [&_a]:underline">
                {s.body}
              </div>
            </section>
          ))}
        </article>
      </div>
    </>
  );
}
